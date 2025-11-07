namespace backend.Services.Storage
{
    public interface IMinioService
    {
        Task<string> UploadFileAsync(string objectName, Stream data, long size, string contentType);
        Task<string> GetPresignedUrlAsync(string objectName);
        Task DeleteFileAsync(string objectName);
        string GetBaseUrl();
    }
}