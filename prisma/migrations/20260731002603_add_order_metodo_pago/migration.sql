BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[orders] ADD [metodo_pago] NVARCHAR(30) NOT NULL CONSTRAINT [orders_metodo_pago_df] DEFAULT 'Efectivo contra entrega';

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
