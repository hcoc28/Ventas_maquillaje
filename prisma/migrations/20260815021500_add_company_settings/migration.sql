BEGIN TRY

BEGIN TRAN;

ALTER TABLE [dbo].[site_settings] ADD
    [nombre_empresa] NVARCHAR(120) NOT NULL CONSTRAINT [site_settings_nombre_empresa_df] DEFAULT 'Amour Bloom',
    [descripcion_empresa] NVARCHAR(500) NOT NULL CONSTRAINT [site_settings_descripcion_empresa_df] DEFAULT 'Tienda en línea de maquillaje 100% original. Brilla con suavidad, florece con estilo.',
    [whatsapp_numero] NVARCHAR(30) NOT NULL CONSTRAINT [site_settings_whatsapp_numero_df] DEFAULT '50200000000',
    [email_notificaciones] NVARCHAR(200) NULL,
    [direccion_empresa] NVARCHAR(300) NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
