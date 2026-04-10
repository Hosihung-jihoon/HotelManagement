USE [HotelManagementDB]
GO

-- Thêm thuộc tính attraction_id vào Articles nối tới Attractions
BEGIN TRANSACTION;

IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[Articles]') 
      AND name = 'attraction_id'
)
BEGIN
    ALTER TABLE [dbo].[Articles]
    ADD [attraction_id] [int] NULL;

    ALTER TABLE [dbo].[Articles]  WITH CHECK ADD  CONSTRAINT [FK_Articles_Attractions] FOREIGN KEY([attraction_id])
    REFERENCES [dbo].[Attractions] ([id])
    ON DELETE SET NULL;

    ALTER TABLE [dbo].[Articles] CHECK CONSTRAINT [FK_Articles_Attractions];
END
GO

COMMIT TRANSACTION;
GO
