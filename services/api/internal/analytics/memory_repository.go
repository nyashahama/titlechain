package analytics

import (
	"context"
	"sync"
	"time"
)

type memoryRepository struct {
	mu       sync.RWMutex
	overview Overview
	window   Window
}

var _ Repository = (*memoryRepository)(nil)

func NewMemoryRepository() *memoryRepository {
	return &memoryRepository{
		overview: emptyOverview(),
	}
}

func (r *memoryRepository) SetOverview(overview Overview) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.overview = copyOverview(overview)
}

func (r *memoryRepository) Overview(ctx context.Context, window Window) (Overview, error) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.window = copyWindow(window)
	return copyOverview(r.overview), nil
}

func (r *memoryRepository) LastWindow() Window {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return copyWindow(r.window)
}

func emptyOverview() Overview {
	return Overview{
		OperatingSummary: OperatingSummary{},
		DecisionMix:      []DecisionMetric{},
		ReasonCodes:      []ReasonCodeMetric{},
		Evidence: EvidenceAnalytics{
			StatusMix:     []EvidenceStatusMetric{},
			SourceTypeMix: []EvidenceSourceMetric{},
		},
		SourceHealth: SourceHealth{LatestRunStatus: "none"},
		RiskQueue:    []RiskQueueItem{},
	}
}

func copyOverview(overview Overview) Overview {
	copied := overview
	copied.Range.From = copyTimePtr(overview.Range.From)
	copied.DecisionMix = copySlice(overview.DecisionMix)
	copied.ReasonCodes = copySlice(overview.ReasonCodes)
	copied.Evidence.StatusMix = copySlice(overview.Evidence.StatusMix)
	copied.Evidence.SourceTypeMix = copySlice(overview.Evidence.SourceTypeMix)
	copied.SourceHealth.LastSuccessfulRunAt = copyTimePtr(overview.SourceHealth.LastSuccessfulRunAt)
	copied.RiskQueue = copyRiskQueue(overview.RiskQueue)
	return copied
}

func copyWindow(window Window) Window {
	copied := window
	copied.From = copyTimePtr(window.From)
	return copied
}

func copyRiskQueue(items []RiskQueueItem) []RiskQueueItem {
	copied := copySlice(items)
	for i := range copied {
		copied[i].RiskReasons = copySlice(copied[i].RiskReasons)
	}
	return copied
}

func copySlice[T any](items []T) []T {
	if items == nil {
		return nil
	}
	copied := make([]T, len(items))
	copy(copied, items)
	return copied
}

func copyTimePtr(t *time.Time) *time.Time {
	if t == nil {
		return nil
	}
	copied := *t
	return &copied
}
