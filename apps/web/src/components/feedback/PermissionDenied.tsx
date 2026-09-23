export function PermissionDenied() {
  return (
    <div className="permission" role="alert">
      <strong>沒有權限</strong>
      <div>目前的 Gitea 帳號無法執行這項操作。</div>
    </div>
  );
}
