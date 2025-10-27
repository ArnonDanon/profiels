using System.Text.Json;
using System.Text.Json.Serialization;
using ProfilesApi.Services;
using ProfilesApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Allow CORS from the Next.js dev server
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000").AllowAnyHeader().AllowAnyMethod();
    });
});

builder.Services.AddSingleton<ProfilesStore>();

// Bind to http://localhost:5001 by default
builder.WebHost.UseUrls("http://localhost:5001");

var app = builder.Build();
app.UseCors();

app.MapGet("/api/profiles/list", async (ProfilesStore store) =>
{
    var profiles = await store.ReadProfilesAsync();
    return Results.Json(profiles);
});

app.MapPost("/api/profiles/add", async (HttpRequest request, ProfilesStore store) =>
{
    if (!request.HasFormContentType) return Results.BadRequest(new { error = "Expected multipart/form-data" });
    var form = await request.ReadFormAsync();
    var profileName = form["profileName"].FirstOrDefault() ?? "Unnamed";
    string? imageUrl = null;

    var file = form.Files.GetFile("profileImage");
    if (file != null && file.Length > 0)
    {
        var fileName = $"{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}_{Path.GetFileName(file.FileName)}";
        var dest = store.GetUploadsPath(fileName);
        Directory.CreateDirectory(Path.GetDirectoryName(dest)!);
        await using var fs = File.Create(dest);
        await file.CopyToAsync(fs);
        imageUrl = $"/uploads/{fileName}";
    }

    var profiles = await store.ReadProfilesAsync();
    var profile = new Profile { Id = Guid.NewGuid().ToString(), ProfileName = profileName, ProfileImage = imageUrl };
    profiles.Insert(0, profile);
    await store.WriteProfilesAsync(profiles);
    return Results.Json(profile);
});

app.MapPost("/api/profiles/edit", async (HttpRequest request, ProfilesStore store) =>
{
    if (!request.HasFormContentType) return Results.BadRequest(new { error = "Expected multipart/form-data" });
    var form = await request.ReadFormAsync();
    var id = form["id"].FirstOrDefault();
    if (string.IsNullOrEmpty(id)) return Results.BadRequest(new { error = "Missing id" });

    var profiles = await store.ReadProfilesAsync();
    var idx = profiles.FindIndex(p => p.Id == id);
    if (idx < 0) return Results.NotFound(new { error = "Profile not found" });

    var profile = profiles[idx];
    var newName = form["profileName"].FirstOrDefault();
    if (!string.IsNullOrEmpty(newName)) profile.ProfileName = newName;

    var file = form.Files.GetFile("profileImage");
    if (file != null && file.Length > 0)
    {
        // delete old image if exists
        if (!string.IsNullOrEmpty(profile.ProfileImage))
        {
            var oldFile = store.GetUploadsPath(Path.GetFileName(profile.ProfileImage));
            if (File.Exists(oldFile)) File.Delete(oldFile);
        }

        var fileName = $"{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}_{Path.GetFileName(file.FileName)}";
        var dest = store.GetUploadsPath(fileName);
        Directory.CreateDirectory(Path.GetDirectoryName(dest)!);
        await using var fs = File.Create(dest);
        await file.CopyToAsync(fs);
        profile.ProfileImage = $"/uploads/{fileName}";
    }

    profiles[idx] = profile;
    await store.WriteProfilesAsync(profiles);
    return Results.Json(profile);
});

app.MapPost("/api/profiles/remove", async (HttpRequest request, ProfilesStore store) =>
{
    var body = await JsonSerializer.DeserializeAsync<JsonElement>(request.Body);
    if (!body.TryGetProperty("id", out var idProp)) return Results.BadRequest(new { error = "Missing id" });
    var id = idProp.GetString();
    if (string.IsNullOrEmpty(id)) return Results.BadRequest(new { error = "Missing id" });

    var profiles = await store.ReadProfilesAsync();
    var idx = profiles.FindIndex(p => p.Id == id);
    if (idx < 0) return Results.NotFound(new { error = "Profile not found" });

    var profile = profiles[idx];
    if (!string.IsNullOrEmpty(profile.ProfileImage))
    {
        var file = store.GetUploadsPath(Path.GetFileName(profile.ProfileImage));
        if (File.Exists(file)) File.Delete(file);
    }

    profiles.RemoveAt(idx);
    await store.WriteProfilesAsync(profiles);
    return Results.Json(new { success = true });
});

app.Run();
