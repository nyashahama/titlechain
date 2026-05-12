package analytics

import (
	"context"
	"fmt"
	"strings"
	"time"
)

type Repository interface {
	Overview(ctx context.Context, window Window) (Overview, error)
}

type Service struct {
	repo Repository
	now  func() time.Time
}

func NewService(repo Repository) Service {
	return Service{repo: repo, now: time.Now}
}

func (s Service) GetOverview(ctx context.Context, rangeKey string) (Overview, error) {
	window, err := NormalizeRange(rangeKey, s.now())
	if err != nil {
		return Overview{}, err
	}
	overview, err := s.repo.Overview(ctx, window)
	if err != nil {
		return Overview{}, err
	}
	overview.Range = Range{
		Key:  window.Key,
		From: window.From,
		To:   window.To,
	}
	return overview, nil
}

func NormalizeRange(rangeKey string, now time.Time) (Window, error) {
	key := strings.TrimSpace(rangeKey)
	if key == "" {
		key = RangeThirtyDays
	}

	to := now.UTC()
	window := Window{Key: key, To: to}
	switch key {
	case RangeSevenDays:
		from := to.AddDate(0, 0, -7)
		window.From = &from
	case RangeThirtyDays:
		from := to.AddDate(0, 0, -30)
		window.From = &from
	case RangeNinetyDays:
		from := to.AddDate(0, 0, -90)
		window.From = &from
	case RangeAll:
		window.From = nil
	default:
		return Window{}, fmt.Errorf("unsupported analytics range %q", rangeKey)
	}
	return window, nil
}
