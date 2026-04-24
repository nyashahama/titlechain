package store

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/nyasha-hama/titlechain/services/api/internal/jobs"
	"github.com/nyasha-hama/titlechain/services/api/internal/store/sqlc"
)

type JobsStore struct {
	pool *pgxpool.Pool
}

var _ jobs.Repository = JobsStore{}

func NewJobsStore(pool *pgxpool.Pool) JobsStore {
	return JobsStore{pool: pool}
}

func (s JobsStore) ListRunsWithCounts(ctx context.Context, limit int32) ([]jobs.RunSummary, error) {
	queries := sqlc.New(s.pool)
	rows, err := queries.ListRunsWithCounts(ctx, limit)
	if err != nil {
		return nil, err
	}

	result := make([]jobs.RunSummary, 0, len(rows))
	for _, row := range rows {
		result = append(result, runSummaryFromRow(row))
	}
	return result, nil
}

func (s JobsStore) FindActiveRun(ctx context.Context, runType string) (*jobs.RunSummary, error) {
	queries := sqlc.New(s.pool)
	run, err := queries.FindActiveRun(ctx, runType)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	summary := runSummaryFromOpsRun(run)
	return &summary, nil
}

func (s JobsStore) CreateSeedProjectionRun(ctx context.Context) (jobs.RunSummary, error) {
	return s.execRunInTx(ctx, func(q *sqlc.Queries) (sqlc.OpsRun, error) {
		batch, err := q.CreateBatch(ctx, sqlc.CreateBatchParams{
			SourceName:     "ops.seed_properties",
			SourceBatchKey: fmt.Sprintf("seed-property-projection-%d", time.Now().UnixNano()),
			PayloadSha256:  "placeholder",
		})
		if err != nil {
			return sqlc.OpsRun{}, err
		}

		run, err := q.CreateRun(ctx, sqlc.CreateRunParams{
			BatchID: batch.ID,
			RunType: jobs.RunTypeSeedPropertyProjection,
			Status:  "pending",
		})
		if err != nil {
			return sqlc.OpsRun{}, mapPgDuplicate(err)
		}

		_, err = q.CreateJob(ctx, sqlc.CreateJobParams{
			RunID:   run.ID,
			JobKind: "seed_property_projection",
		})
		if err != nil {
			return sqlc.OpsRun{}, err
		}

		return run, nil
	})
}

func (s JobsStore) CreateSourceIngestionRun(ctx context.Context, req jobs.StartSourceIngestionRequest) (jobs.RunSummary, error) {
	return s.execRunInTx(ctx, func(q *sqlc.Queries) (sqlc.OpsRun, error) {
		batch, err := q.CreateSourceBatch(ctx, sqlc.CreateSourceBatchParams{
			SourceName:     req.SourceName,
			SourceBatchKey: req.BatchKey,
			PayloadUri:     pgtype.Text{String: req.PayloadURI, Valid: req.PayloadURI != ""},
			PayloadSha256:  req.PayloadSHA256,
		})
		if err != nil {
			return sqlc.OpsRun{}, err
		}

		run, err := q.CreateIngestionRun(ctx, batch.ID)
		if err != nil {
			return sqlc.OpsRun{}, mapPgDuplicate(err)
		}

		for _, kind := range jobs.IngestionJobKinds {
			_, err = q.CreateIngestionJob(ctx, sqlc.CreateIngestionJobParams{
				RunID:   run.ID,
				JobKind: kind,
			})
			if err != nil {
				return sqlc.OpsRun{}, err
			}
		}

		return run, nil
	})
}

func (s JobsStore) execRunInTx(ctx context.Context, fn func(*sqlc.Queries) (sqlc.OpsRun, error)) (jobs.RunSummary, error) {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return jobs.RunSummary{}, err
	}
	defer tx.Rollback(ctx)

	run, err := fn(sqlc.New(s.pool).WithTx(tx))
	if err != nil {
		return jobs.RunSummary{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return jobs.RunSummary{}, err
	}
	return runSummaryFromOpsRun(run), nil
}

func mapPgDuplicate(err error) error {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == "23505" {
		return jobs.ErrActiveRun
	}
	return err
}

func runSummaryFromRow(row sqlc.ListRunsWithCountsRow) jobs.RunSummary {
	summary := jobs.RunSummary{
		ID:            uuidToString(row.ID),
		RunType:       row.RunType,
		Status:        row.Status,
		CreatedAt:     row.CreatedAt.Time,
		TotalJobs:     int(row.TotalJobs),
		CompletedJobs: int(row.CompletedJobs),
		FailedJobs:    int(row.FailedJobs),
	}
	if row.StartedAt.Valid {
		t := row.StartedAt.Time
		summary.StartedAt = &t
	}
	if row.FinishedAt.Valid {
		t := row.FinishedAt.Time
		summary.FinishedAt = &t
	}
	if row.LatestError != nil {
		if s, ok := row.LatestError.(string); ok {
			summary.LatestError = s
		}
	}
	return summary
}

func runSummaryFromOpsRun(run sqlc.OpsRun) jobs.RunSummary {
	summary := jobs.RunSummary{
		ID:        uuidToString(run.ID),
		RunType:   run.RunType,
		Status:    run.Status,
		CreatedAt: run.CreatedAt.Time,
	}
	if run.StartedAt.Valid {
		t := run.StartedAt.Time
		summary.StartedAt = &t
	}
	if run.FinishedAt.Valid {
		t := run.FinishedAt.Time
		summary.FinishedAt = &t
	}
	return summary
}

