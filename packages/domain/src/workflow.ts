export type WorkflowState = {
  key: string;
  labelName: string;
  displayName: string;
  order: number;
};

export type WorkflowConvention = {
  id: string;
  version: string;
  name: string;
  states: WorkflowState[];
};
