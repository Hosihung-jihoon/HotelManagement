using HotelManagement.API.DTOs;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace HotelManagement.API.Services;

public class MomoService : IMomoService
{
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;

    public MomoService(IConfiguration configuration, HttpClient httpClient)
    {
        _configuration = configuration;
        _httpClient = httpClient;
    }

    public async Task<MomoCreatePaymentResponseDto> CreatePaymentAsync(MomoRequestDto request)
    {
        var momoConfig = _configuration.GetSection("MOMO");
        var partnerCode = momoConfig["PartnerCode"];
        var accessKey = momoConfig["AccessKey"];
        var secretKey = momoConfig["SecretKey"];
        var endpoint = momoConfig["Url"];
        var redirectUrl = momoConfig["ReturnUrl"];
        var ipnUrl = momoConfig["IpnUrl"];

        var orderId = DateTime.UtcNow.Ticks.ToString();
        var requestId = Guid.NewGuid().ToString();
        var extraData = ""; // Can be used to pass booking ID or other info
        var orderInfo = request.OrderInfo ?? $"Thanh toán đơn đặt phòng {request.BookingId}";
        var requestType = "captureWallet";
        var amount = ((long)request.Amount).ToString();

        // accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
        var rawSignature = $"accessKey={accessKey}&amount={amount}&extraData={extraData}&ipnUrl={ipnUrl}&orderId={orderId}&orderInfo={orderInfo}&partnerCode={partnerCode}&redirectUrl={redirectUrl}&requestId={requestId}&requestType={requestType}";
        
        var signature = SignSHA256(rawSignature, secretKey!);

        var requestData = new
        {
            partnerCode,
            partnerName = "Test",
            storeId = "MomoTestStore",
            requestId,
            amount = long.Parse(amount),
            orderId,
            orderInfo,
            redirectUrl,
            ipnUrl,
            lang = "vi",
            extraData,
            requestType,
            signature
        };

        var content = new StringContent(JsonSerializer.Serialize(requestData, new JsonSerializerOptions 
        { 
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase 
        }), Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync(endpoint, content);
        var responseString = await response.Content.ReadAsStringAsync();

        return JsonSerializer.Deserialize<MomoCreatePaymentResponseDto>(responseString, new JsonSerializerOptions 
        { 
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase 
        })!;
    }

    public bool ValidateSignature(MomoCallbackDto callback)
    {
        var momoConfig = _configuration.GetSection("MOMO");
        var accessKey = momoConfig["AccessKey"];
        var secretKey = momoConfig["SecretKey"];

        // accessKey=$accessKey&amount=$amount&extraData=$extraData&message=$message&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&requestId=$requestId&responseTime=$responseTime&resultCode=$resultCode&transId=$transId
        var rawSignature = $"accessKey={accessKey}&amount={callback.Amount}&extraData={callback.ExtraData}&message={callback.Message}&orderId={callback.OrderId}&orderInfo={callback.OrderInfo}&partnerCode={callback.PartnerCode}&requestId={callback.RequestId}&responseTime={callback.ResponseTime}&resultCode={callback.ResultCode}&transId={callback.TransId}";
        
        var checkSignature = SignSHA256(rawSignature, secretKey!);

        return checkSignature.Equals(callback.Signature, StringComparison.OrdinalIgnoreCase);
    }

    private string SignSHA256(string message, string key)
    {
        byte[] keyByte = Encoding.UTF8.GetBytes(key);
        byte[] messageBytes = Encoding.UTF8.GetBytes(message);
        using (var hmacsha256 = new HMACSHA256(keyByte))
        {
            byte[] hashmessage = hmacsha256.ComputeHash(messageBytes);
            return BitConverter.ToString(hashmessage).Replace("-", "").ToLower();
        }
    }
}
