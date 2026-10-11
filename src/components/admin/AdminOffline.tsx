export default function AdminOffline() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center px-4 py-12 text-center">
      <h1 className="text-3xl font-bold text-foreground">Admin is offline</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        This static build does not include admin tools or server routes.
      </p>
    </div>
  );
}
