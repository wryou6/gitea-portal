import type { Meta, StoryObj } from "@storybook/react";
import { useTranslation } from "react-i18next";
import { Badge } from "./Badge";
import { IssueStatusBadge } from "./IssueStatusBadge";
import { IssueTypeBadge } from "./IssueTypeBadge";
import { PriorityBadge } from "./PriorityBadge";
import { LabelList } from "../../features/issues/LabelList";

function IssueBadgePalette() {
  const { t } = useTranslation("issues");
  return (
    <div className="issue-badge-palette">
      <section>
        <h2>{t("status")}</h2>
        <div className="issue-badge-palette__items">
          <IssueStatusBadge status="todo" />
          <IssueStatusBadge status="in-progress" />
          <IssueStatusBadge status="done" />
          <IssueStatusBadge status="anomaly" />
        </div>
      </section>
      <section>
        <h2>{t("priorityLabel")}</h2>
        <div className="issue-badge-palette__items">
          {(["critical", "high", "medium", "low"] as const).map((priority) => (
            <PriorityBadge
              key={priority}
              priority={priority}
              labels={[{ name: `priority:${priority}` }]}
            />
          ))}
          <PriorityBadge priority={null} labels={[]} />
          <PriorityBadge
            priority={null}
            labels={[{ name: "priority:critical" }, { name: "priority:low" }]}
          />
        </div>
      </section>
      <section>
        <h2>{t("type")}</h2>
        <div className="issue-badge-palette__items">
          {(["bug", "feature", "task"] as const).map((type) => (
            <IssueTypeBadge
              key={type}
              type={type}
              labels={[{ name: `type:${type}` }]}
            />
          ))}
          <IssueTypeBadge type={null} labels={[]} />
          <IssueTypeBadge
            type={null}
            labels={[{ name: "type:bug" }, { name: "type:task" }]}
          />
        </div>
      </section>
      <section>
        <h2>{t("labels")}</h2>
        <div className="issue-badge-palette__items">
          <Badge>{t("labels")}</Badge>
          <Badge>{t("notSet")}</Badge>
          <LabelList
            labels={[
              { name: "Blue", color: "2563eb" },
              { name: "Sunlight", color: "fde68a" },
              { name: "Snow", color: "f8fafc" },
            ]}
          />
        </div>
      </section>
    </div>
  );
}

const meta = {
  title: "Issue badges/Palette",
  component: IssueBadgePalette,
} satisfies Meta<typeof IssueBadgePalette>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllBadgeFamilies: Story = {};
export const DarkTheme: Story = { globals: { theme: "dark" } };
export const NarrowViewport: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
