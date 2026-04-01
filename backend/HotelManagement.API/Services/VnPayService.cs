using HotelManagement.API.DTOs;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Web;

namespace HotelManagement.API.Services;

public class VnPayService : IVnPayService
{
    private readonly IConfiguration _configuration;

    public VnPayService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string CreatePaymentUrl(HttpContext context, VnPayRequestDto request)
    {
        var vnpayConfig = _configuration.GetSection("VnPay");
        var vnp_TmnCode = vnpayConfig["TmnCode"];
        var vnp_HashSecret = vnpayConfig["HashSecret"];
        var vnp_Url = vnpayConfig["Url"];
        var vnp_ReturnUrl = vnpayConfig["ReturnUrl"];

        var vnpayData = new SortedList<string, string>(new VnPayCompare());
        vnpayData.Add("vnp_Version", "2.1.0");
        vnpayData.Add("vnp_Command", "pay");
        vnpayData.Add("vnp_TmnCode", vnp_TmnCode!);
        vnpayData.Add("vnp_Amount", (request.Amount * 100).ToString("0")); 
        vnpayData.Add("vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss"));
        vnpayData.Add("vnp_CurrCode", "VND");
        vnpayData.Add("vnp_IpAddr", context.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1");
        vnpayData.Add("vnp_Locale", "vn");
        vnpayData.Add("vnp_OrderInfo", $"Thanh toan don hang {request.BookingId}");
        vnpayData.Add("vnp_OrderType", "other");
        vnpayData.Add("vnp_ReturnUrl", vnp_ReturnUrl!);
        vnpayData.Add("vnp_TxnRef", request.BookingId.ToString());

        var queryString = new StringBuilder();
        foreach (var kv in vnpayData)
        {
            if (!string.IsNullOrEmpty(kv.Value))
            {
                queryString.Append(WebUtility.UrlEncode(kv.Key) + "=" + WebUtility.UrlEncode(kv.Value) + "&");
            }
        }
        var signData = queryString.ToString().TrimEnd('&');

        var vnp_SecureHash = HmacSHA512(vnp_HashSecret!, signData);
        var paymentUrl = vnp_Url + "?" + signData + "&vnp_SecureHash=" + vnp_SecureHash;

        return paymentUrl;
    }

    public bool ValidateSignature(IQueryCollection collections)
    {
        var vnpayData = new SortedList<string, string>(new VnPayCompare());
        var vnp_SecureHash = string.Empty;

        foreach (var kv in collections)
        {
            if (!string.IsNullOrEmpty(kv.Key) && kv.Key.StartsWith("vnp_"))
            {
                if (kv.Key == "vnp_SecureHash")
                    vnp_SecureHash = kv.Value;
                else
                    vnpayData.Add(kv.Key, kv.Value.ToString());
            }
        }

        var queryString = new StringBuilder();
        foreach (var kv in vnpayData)
        {
            if (!string.IsNullOrEmpty(kv.Value))
            {
                queryString.Append(WebUtility.UrlEncode(kv.Key) + "=" + WebUtility.UrlEncode(kv.Value) + "&");
            }
        }
        var signData = queryString.ToString().TrimEnd('&');

        var vnpayConfig = _configuration.GetSection("VnPay");
        var vnp_HashSecret = vnpayConfig["HashSecret"];

        var checkSignature = HmacSHA512(vnp_HashSecret!, signData);

        return checkSignature.Equals(vnp_SecureHash, StringComparison.InvariantCultureIgnoreCase);
    }

    private string HmacSHA512(string key, string inputData)
    {
        var hash = new StringBuilder();
        var keyBytes = Encoding.UTF8.GetBytes(key);
        var inputBytes = Encoding.UTF8.GetBytes(inputData);
        using (var hmac = new HMACSHA512(keyBytes))
        {
            var hashValue = hmac.ComputeHash(inputBytes);
            foreach (var theByte in hashValue)
            {
                hash.Append(theByte.ToString("x2"));
            }
        }

        return hash.ToString();
    }

    private class VnPayCompare : IComparer<string>
    {
        public int Compare(string? x, string? y)
        {
            if (x == y) return 0;
            if (x == null) return -1;
            if (y == null) return 1;
            return string.Compare(x, y, StringComparison.Ordinal);
        }
    }
}
