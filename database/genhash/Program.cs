global using BCrypt.Net;
var h = BCrypt.HashPassword("admin", 11);
System.Console.WriteLine(h);
