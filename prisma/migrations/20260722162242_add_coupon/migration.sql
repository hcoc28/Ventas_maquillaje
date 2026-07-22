BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[coupons] (
    [id] INT NOT NULL IDENTITY(1,1),
    [codigo] NVARCHAR(30) NOT NULL,
    [porcentaje_descuento] DECIMAL(5,2) NOT NULL,
    [fecha_inicio] DATETIME2 NOT NULL,
    [fecha_fin] DATETIME2 NOT NULL,
    [uso_maximo] INT,
    [veces_usado] INT NOT NULL CONSTRAINT [coupons_veces_usado_df] DEFAULT 0,
    [activo] BIT NOT NULL CONSTRAINT [coupons_activo_df] DEFAULT 1,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [coupons_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [coupons_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [coupons_codigo_key] UNIQUE NONCLUSTERED ([codigo])
);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
