namespace ProfilesApi.Models;

public class Profile
{
    public string Id { get; set; } = string.Empty;
    public string ProfileName { get; set; } = string.Empty;
    public string? ProfileImage { get; set; }
}
