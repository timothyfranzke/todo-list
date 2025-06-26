using TodoApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register the storage service as a singleton
builder.Services.AddSingleton<IStorageService, MemoryStorageService>();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseDeveloperExceptionPage();
}

app.UseHttpsRedirection();
app.UseCors();
app.UseAuthorization();
app.MapControllers();

// Add middleware to log API requests
app.Use(async (context, next) =>
{
    var start = DateTime.UtcNow;
    var path = context.Request.Path;
    
    // Call the next delegate/middleware in the pipeline
    await next();
    
    var duration = (DateTime.UtcNow - start).TotalMilliseconds;
    
    if (path.StartsWithSegments("/api"))
    {
        var logLine = $"{context.Request.Method} {path} {context.Response.StatusCode} in {duration}ms";
        app.Logger.LogInformation(logLine);
    }
});

app.Run();
