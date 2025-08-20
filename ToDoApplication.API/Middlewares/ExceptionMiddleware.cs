using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Net;
using System.Threading.Tasks;
using System.Text.Json;

namespace ToDoApplication.API.Middlewares
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            // Unique Trace Id
            var traceId = Guid.NewGuid().ToString();

            //LOG formatı - daha düzenli
            _logger.LogError(exception,
                "💥 Hata yakalandı! TraceId={TraceId}, Path={Path}, User={User}, StatusCode={StatusCode}, Message={Message}",
                traceId,
                context.Request.Path,
                context.User.Identity?.Name ?? "Anonymous",
                (int)HttpStatusCode.InternalServerError,
                exception.Message
            );

            // Swagger / Response kısmı: değişmiyor!
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

            var response = new
            {
                error = "Sunucu hatası. Daha sonra tekrar deneyiniz."
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
    }
}
