package notifications

import (
	"fmt"
	"log/slog"

	"github.com/slack-go/slack"
	"github.com/willtrojniak/tabapp-monorepo/models"
)

type SlackDriver struct {
	logger *slog.Logger
}

func NewSlackDriver(logger *slog.Logger) *SlackDriver {
	return &SlackDriver{logger: logger}
}

func (d *SlackDriver) Name() string { return "Slack" }
func (d *SlackDriver) NotifyShop(shop *models.Shop, n Notification) error {
	channel := fmt.Sprintf("#%s", n.SlackChannel(shop))
	if channel == "#" {
		return nil
	}

	client := slack.New(shop.SlackAccessToken.String())
	_, _, _, err := client.SendMessage(channel, slack.MsgOptionBlocks(d.toMsg(n)...))
	if err != nil {
		d.logger.Error("Failed to send Slack message", "shop_id", shop.Id, "channel", channel, "err", err)
	}
	return err
}
func (d *SlackDriver) NotifyUsers([]*models.User, Notification) error { return nil }

func (d *SlackDriver) toMsg(n Notification) []slack.Block {
	// Header
	headerText := slack.NewTextBlockObject("mrkdwn", n.Heading(), false, false)
	headerSection := slack.NewSectionBlock(headerText, nil, nil)

	// Fields
	var fields []*slack.TextBlockObject
	for _, kv := range n.Data() {
		fields = append(fields, slack.NewTextBlockObject("mrkdwn", fmt.Sprintf("*%s:* %s", kv.Field, kv.Value), false, false))
	}
	fieldsSection := slack.NewSectionBlock(nil, fields, nil)

	// Footer
	footerText := slack.NewTextBlockObject("mrkdwn", fmt.Sprintf("<%s| View on CafeTrackr>", n.ResourceURL()), false, false)
	footerSection := slack.NewSectionBlock(footerText, nil, nil)

	return []slack.Block{
		headerSection,
		fieldsSection,
		footerSection,
	}
}
