using System.Text.Json;
using ProfilesApi.Models;

namespace ProfilesApi.Services;

public class ProfilesStore
{
    private readonly string _dataPath;
    private readonly string _uploadsDir;
    private readonly SemaphoreSlim _lock = new(1,1);
    private readonly JsonSerializerOptions _jsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase, WriteIndented = true };

    public ProfilesStore()
    {
        // data/profiles.json and public/uploads are sibling directories to this project folder
        var projectDir = Directory.GetCurrentDirectory();
        _dataPath = Path.GetFullPath(Path.Combine(projectDir, "..", "data", "profiles.json"));
        _uploadsDir = Path.GetFullPath(Path.Combine(projectDir, "..", "public", "uploads"));
    }

    public string GetUploadsPath(string fileName) => Path.Combine(_uploadsDir, fileName ?? string.Empty);

    public async Task<List<Profile>> ReadProfilesAsync()
    {
        await _lock.WaitAsync();
        try
        {
            if (!File.Exists(_dataPath))
            {
                Directory.CreateDirectory(Path.GetDirectoryName(_dataPath)!);
                await File.WriteAllTextAsync(_dataPath, "[]");
            }

            var json = await File.ReadAllTextAsync(_dataPath);
            var profiles = JsonSerializer.Deserialize<List<Profile>>(json, _jsonOptions) ?? new List<Profile>();
            return profiles;
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task WriteProfilesAsync(List<Profile> profiles)
    {
        await _lock.WaitAsync();
        try
        {
            Directory.CreateDirectory(Path.GetDirectoryName(_dataPath)!);
            var json = JsonSerializer.Serialize(profiles, _jsonOptions);
            await File.WriteAllTextAsync(_dataPath, json);
        }
        finally
        {
            _lock.Release();
        }
    }
}
