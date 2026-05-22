using System;
using System.IO;
using Microsoft.Data.Sqlite;

class Program
{
    static void Main()
    {
        string dbPath = @"C:\web\HotelManagement\database\hotel.db";
        string sqlPath = @"C:\web\HotelManagement\database\hotel.sql";

        if (!File.Exists(sqlPath))
        {
            Console.WriteLine("SQL file not found.");
            return;
        }

        string sql = File.ReadAllText(sqlPath);
        
        using (var connection = new SqliteConnection($"Data Source={dbPath}"))
        {
            connection.Open();
            using (var command = connection.CreateCommand())
            {
                command.CommandText = sql;
                command.ExecuteNonQuery();
            }
        }
        
        Console.WriteLine("SQL script executed successfully!");
    }
}
