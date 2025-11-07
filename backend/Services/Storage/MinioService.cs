using backend.Helpers;
using Microsoft.Extensions.Options;
using Minio;
using Minio.DataModel.Args;

namespace backend.Services.Storage
{
    public class MinioService : IMinioService
    {
        private readonly MinioClient _minioClient;
        private readonly MinioSettings _settings;

        public MinioService(IOptions<MinioSettings> settings)
        {
            _settings = settings.Value;
            _minioClient = (MinioClient?)new MinioClient()
                .WithEndpoint(_settings.Endpoint)
                .WithCredentials(_settings.AccessKey, _settings.SecretKey)
                .Build();
        }

        public async Task<string> UploadFileAsync(string objectName, Stream data, long size, string contentType)
        {
            await EnsureBucketExistsAsync();

            var putObjectArgs = new PutObjectArgs()
                .WithBucket(_settings.Bucket)
                .WithObject(objectName)
                .WithStreamData(data)
                .WithObjectSize(size)
                .WithContentType(contentType);

            await _minioClient.PutObjectAsync(putObjectArgs).ConfigureAwait(false);

            return objectName;
        }

        public async Task<string> GetPresignedUrlAsync(string objectName)
        {
            var presignedGetObjectArgs = new PresignedGetObjectArgs()
                .WithBucket(_settings.Bucket)
                .WithObject(objectName)
                .WithExpiry(60 * 60 * 24); // 1 day expiry

            return await _minioClient.PresignedGetObjectAsync(presignedGetObjectArgs).ConfigureAwait(false);
        }

        public async Task DeleteFileAsync(string objectName)
        {
            var removeObjectArgs = new RemoveObjectArgs()
                .WithBucket(_settings.Bucket)
                .WithObject(objectName);

            await _minioClient.RemoveObjectAsync(removeObjectArgs).ConfigureAwait(false);
        }

        private async Task EnsureBucketExistsAsync()
        {
            var bucketExistsArgs = new BucketExistsArgs().WithBucket(_settings.Bucket);
            bool found = await _minioClient.BucketExistsAsync(bucketExistsArgs).ConfigureAwait(false);
            if (!found)
            {
                var makeBucketArgs = new MakeBucketArgs().WithBucket(_settings.Bucket);
                await _minioClient.MakeBucketAsync(makeBucketArgs).ConfigureAwait(false);
            }
        }
        public string GetBaseUrl()
        {
            return $"http://{_settings.Endpoint}/{_settings.Bucket}";
        }

    }
}