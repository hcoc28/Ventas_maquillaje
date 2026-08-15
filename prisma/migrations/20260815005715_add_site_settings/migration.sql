BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[site_settings] (
    [id] INT NOT NULL CONSTRAINT [site_settings_id_df] DEFAULT 1,
    [mostrar_filtro_marcas] BIT NOT NULL CONSTRAINT [site_settings_mostrar_filtro_marcas_df] DEFAULT 1,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [site_settings_pkey] PRIMARY KEY CLUSTERED ([id])
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
