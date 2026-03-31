const FullPageLoader = () => {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center">
      <div className="h-12 w-12 rounded-full border-4 border-muted border-t-primary animate-spin" />
    </div>
  );
};

export default FullPageLoader;