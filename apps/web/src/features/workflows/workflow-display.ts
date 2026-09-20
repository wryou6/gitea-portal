export const workflowDisplay = (state: string) => state === 'unconfigured' ? '未設定狀態' : state === 'conflict' ? '狀態衝突' : state;
