package property

import (
	"context"
)

type Service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return Service{repo: repo}
}

func (s Service) ListProperties(ctx context.Context, filter ListFilter) ([]PropertySummary, error) {
	if filter.Limit <= 0 {
		filter.Limit = 50
	}
	if filter.Limit > 100 {
		filter.Limit = 100
	}
	rows, err := s.repo.ListProperties(ctx, filter)
	if err != nil {
		return nil, err
	}
	result := make([]PropertySummary, 0, len(rows))
	for _, r := range rows {
		if filter.Query != "" {
			desc := r.PropertyDescription
			title := r.TitleReference
			if !containsLower(desc, filter.Query) && !containsLower(title, filter.Query) {
				continue
			}
		}
		if filter.Locality != "" && !eqLower(r.LocalityOrArea, filter.Locality) {
			continue
		}
		if filter.Status != "" && !eqLower(r.Status, filter.Status) {
			continue
		}
		result = append(result, r)
	}
	return result, nil
}

func containsLower(s, sub string) bool {
	sl := len(s)
	subl := len(sub)
	if subl == 0 {
		return true
	}
	for i := 0; i <= sl-subl; i++ {
		match := true
		for j := 0; j < subl; j++ {
			sc := s[i+j]
			tc := sub[j]
			if sc >= 'A' && sc <= 'Z' {
				sc += 32
			}
			if tc >= 'A' && tc <= 'Z' {
				tc += 32
			}
			if sc != tc {
				match = false
				break
			}
		}
		if match {
			return true
		}
	}
	return false
}

func eqLower(a, b string) bool {
	if len(a) != len(b) {
		return false
	}
	for i := 0; i < len(a); i++ {
		ac := a[i]
		bc := b[i]
		if ac >= 'A' && ac <= 'Z' {
			ac += 32
		}
		if bc >= 'A' && bc <= 'Z' {
			bc += 32
		}
		if ac != bc {
			return false
		}
	}
	return true
}