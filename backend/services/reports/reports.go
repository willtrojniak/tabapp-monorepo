package reports

import (
	"context"
	"log/slog"
	"slices"

	"github.com/willtrojniak/tabapp-monorepo/db"
	"github.com/willtrojniak/tabapp-monorepo/models"
	"github.com/willtrojniak/tabapp-monorepo/services/events"
)

type ReportHandler struct {
	store      *db.PgxStore
	dispatcher *events.EventDispatcher
	logger     *slog.Logger
}

func NewReportHandler(store *db.PgxStore, dispatcher *events.EventDispatcher, logger *slog.Logger) *ReportHandler {
	return &ReportHandler{
		store:      store,
		dispatcher: dispatcher,
		logger:     logger,
	}
}

func (rh *ReportHandler) GenerateShopTabOverview(ctx context.Context, shopId int) error {
	var shop *models.Shop
	var tabs []models.TabOverview
	err := db.WithTx(ctx, rh.store, func(pq *db.PgxQueries) error {
		var err error
		shop, err = pq.GetShopById(ctx, shopId)
		if err != nil {
			return err
		}

		query := models.GetTabsQueryParams{ShopId: &shopId}
		tabs, err = pq.GetTabs(ctx, &query)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		rh.logger.ErrorContext(ctx, "Failed to generate shop tab overview", "shopId", shopId, "err", err)
		return err
	}

	tabs = slices.DeleteFunc(tabs, func(t models.TabOverview) bool {
		return !t.IsActiveToday()
	})

	slices.SortFunc(tabs, func(t1, t2 models.TabOverview) int {
		return int(t1.DailyStartTime.Minutes() - t2.DailyStartTime.Minutes())
	})

	events.Dispatch(rh.dispatcher, events.DailyTabReportEvent{Shop: shop, Tabs: tabs})
	return nil
}
