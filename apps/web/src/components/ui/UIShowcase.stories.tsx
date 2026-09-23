import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Alert } from "./Alert";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Card } from "./Card";
import { Checkbox } from "./Checkbox";
import { Dialog } from "./Dialog";
import { DropdownMenu } from "./DropdownMenu";
import { Field, FieldLabel, Input, Textarea } from "./Field";
import { Label } from "./Label";
import { Select } from "./Select";
import { Separator } from "./Separator";
import { Sheet } from "./Sheet";
import { Skeleton } from "./Skeleton";
import { Table } from "./Table";

const meta = { title: "UI/Core components" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function Showcase() {
  const [sheetOpen, setSheetOpen] = useState(false);
  return (
    <div className="stack">
      <Card>
        <h2>共用元件</h2>
        <div className="actions">
          <Button>主要操作</Button>
          <Button variant="secondary">次要操作</Button>
          <Button variant="danger">刪除</Button>
          <Badge>狀態</Badge>
        </div>
        <div className="stack">
          <Field>
            <FieldLabel htmlFor="showcase-input">文字欄位</FieldLabel>
            <Input id="showcase-input" placeholder="輸入內容" />
          </Field>
          <Field>
            <FieldLabel htmlFor="showcase-select">選擇欄位</FieldLabel>
            <Select id="showcase-select">
              <option>選項一</option>
            </Select>
          </Field>
          <Field>
            <Label htmlFor="showcase-check">
              <Checkbox id="showcase-check" /> 啟用通知
            </Label>
          </Field>
          <Field>
            <FieldLabel htmlFor="showcase-textarea">多行內容</FieldLabel>
            <Textarea id="showcase-textarea" placeholder="描述" />
          </Field>
        </div>
        <Separator />
        <DropdownMenu>
          <summary>DropdownMenu</summary>
          <p className="muted">可鍵盤展開的原生選單容器。</p>
        </DropdownMenu>
        <Button variant="secondary" onClick={() => setSheetOpen(true)}>
          開啟 Sheet
        </Button>
      </Card>
      <Alert variant="success">儲存成功</Alert>
      <Alert variant="warning">請檢查設定</Alert>
      <Skeleton />
      <Table>
        <thead>
          <tr>
            <th scope="col">Repository</th>
            <th scope="col">Issue</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>demo/frontend</td>
            <td>#42</td>
          </tr>
        </tbody>
      </Table>
      <Dialog open title="Dialog 狀態" onClose={() => undefined}>
        <p>對話框內容</p>
      </Dialog>
      <Sheet open={sheetOpen} title="Sheet 狀態" onOpenChange={setSheetOpen}>
        <p>抽屜內容</p>
      </Sheet>
    </div>
  );
}

export const Components: Story = { render: () => <Showcase /> };
