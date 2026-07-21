BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[roles] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(50) NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [roles_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [roles_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [roles_nombre_key] UNIQUE NONCLUSTERED ([nombre])
);

-- CreateTable
CREATE TABLE [dbo].[users] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(100) NOT NULL,
    [apellido] NVARCHAR(100) NOT NULL,
    [email] NVARCHAR(200) NOT NULL,
    [password_hash] NVARCHAR(255) NOT NULL,
    [telefono] NVARCHAR(30),
    [direccion] NVARCHAR(300),
    [role_id] INT NOT NULL,
    [activo] BIT NOT NULL CONSTRAINT [users_activo_df] DEFAULT 1,
    [deleted_at] DATETIME2,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [users_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [users_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[categories] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(100) NOT NULL,
    [slug] NVARCHAR(120) NOT NULL,
    [descripcion] NVARCHAR(500),
    [imagen_url] NVARCHAR(500),
    [icono] NVARCHAR(60),
    [orden] INT NOT NULL CONSTRAINT [categories_orden_df] DEFAULT 0,
    [activo] BIT NOT NULL CONSTRAINT [categories_activo_df] DEFAULT 1,
    [deleted_at] DATETIME2,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [categories_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [categories_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [categories_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[brands] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(100) NOT NULL,
    [slug] NVARCHAR(120) NOT NULL,
    [descripcion] NVARCHAR(500),
    [logo_url] NVARCHAR(500),
    [activo] BIT NOT NULL CONSTRAINT [brands_activo_df] DEFAULT 1,
    [deleted_at] DATETIME2,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [brands_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [brands_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [brands_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[promotions] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(120) NOT NULL,
    [descripcion] NVARCHAR(500),
    [porcentaje_descuento] DECIMAL(5,2) NOT NULL,
    [fecha_inicio] DATETIME2 NOT NULL,
    [fecha_fin] DATETIME2 NOT NULL,
    [activo] BIT NOT NULL CONSTRAINT [promotions_activo_df] DEFAULT 1,
    [deleted_at] DATETIME2,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [promotions_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [promotions_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[products] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(150) NOT NULL,
    [slug] NVARCHAR(180) NOT NULL,
    [descripcion_corta] NVARCHAR(300) NOT NULL,
    [descripcion_larga] NVARCHAR(max) NOT NULL,
    [ingredientes] NVARCHAR(max),
    [modo_uso] NVARCHAR(max),
    [beneficios] NVARCHAR(max),
    [precio] DECIMAL(10,2) NOT NULL,
    [es_nuevo] BIT NOT NULL CONSTRAINT [products_es_nuevo_df] DEFAULT 0,
    [es_edicion_limitada] BIT NOT NULL CONSTRAINT [products_es_edicion_limitada_df] DEFAULT 0,
    [activo] BIT NOT NULL CONSTRAINT [products_activo_df] DEFAULT 1,
    [category_id] INT NOT NULL,
    [brand_id] INT NOT NULL,
    [promotion_id] INT,
    [deleted_at] DATETIME2,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [products_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [products_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [products_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[product_images] (
    [id] INT NOT NULL IDENTITY(1,1),
    [product_id] INT NOT NULL,
    [url] NVARCHAR(500) NOT NULL,
    [texto_alt] NVARCHAR(200) NOT NULL,
    [orden] INT NOT NULL CONSTRAINT [product_images_orden_df] DEFAULT 0,
    [es_principal] BIT NOT NULL CONSTRAINT [product_images_es_principal_df] DEFAULT 0,
    CONSTRAINT [product_images_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[inventory] (
    [id] INT NOT NULL IDENTITY(1,1),
    [product_id] INT NOT NULL,
    [stock] INT NOT NULL CONSTRAINT [inventory_stock_df] DEFAULT 0,
    [stock_minimo] INT NOT NULL CONSTRAINT [inventory_stock_minimo_df] DEFAULT 5,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [inventory_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [inventory_product_id_key] UNIQUE NONCLUSTERED ([product_id])
);

-- CreateTable
CREATE TABLE [dbo].[orders] (
    [id] INT NOT NULL IDENTITY(1,1),
    [numero_pedido] NVARCHAR(30) NOT NULL,
    [user_id] INT NOT NULL,
    [estado] NVARCHAR(20) NOT NULL CONSTRAINT [orders_estado_df] DEFAULT 'Pendiente',
    [subtotal] DECIMAL(10,2) NOT NULL,
    [total] DECIMAL(10,2) NOT NULL,
    [nombre_contacto] NVARCHAR(150) NOT NULL,
    [telefono_contacto] NVARCHAR(30) NOT NULL,
    [direccion_entrega] NVARCHAR(400) NOT NULL,
    [observaciones] NVARCHAR(1000),
    [created_at] DATETIME2 NOT NULL CONSTRAINT [orders_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [orders_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [orders_numero_pedido_key] UNIQUE NONCLUSTERED ([numero_pedido])
);

-- CreateTable
CREATE TABLE [dbo].[order_details] (
    [id] INT NOT NULL IDENTITY(1,1),
    [order_id] INT NOT NULL,
    [product_id] INT NOT NULL,
    [nombre_producto] NVARCHAR(150) NOT NULL,
    [cantidad] INT NOT NULL,
    [precio_unitario] DECIMAL(10,2) NOT NULL,
    CONSTRAINT [order_details_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[cart] (
    [id] INT NOT NULL IDENTITY(1,1),
    [user_id] INT,
    [session_id] NVARCHAR(100),
    [created_at] DATETIME2 NOT NULL CONSTRAINT [cart_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [cart_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [cart_user_id_key] UNIQUE NONCLUSTERED ([user_id]),
    CONSTRAINT [cart_session_id_key] UNIQUE NONCLUSTERED ([session_id])
);

-- CreateTable
CREATE TABLE [dbo].[cart_items] (
    [id] INT NOT NULL IDENTITY(1,1),
    [cart_id] INT NOT NULL,
    [product_id] INT NOT NULL,
    [cantidad] INT NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [cart_items_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [cart_items_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [cart_items_cart_id_product_id_key] UNIQUE NONCLUSTERED ([cart_id],[product_id])
);

-- CreateTable
CREATE TABLE [dbo].[reviews] (
    [id] INT NOT NULL IDENTITY(1,1),
    [product_id] INT NOT NULL,
    [user_id] INT NOT NULL,
    [calificacion] INT NOT NULL,
    [comentario] NVARCHAR(1000) NOT NULL,
    [aprobada] BIT NOT NULL CONSTRAINT [reviews_aprobada_df] DEFAULT 0,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [reviews_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [reviews_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[favorites] (
    [user_id] INT NOT NULL,
    [product_id] INT NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [favorites_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [favorites_pkey] PRIMARY KEY CLUSTERED ([user_id],[product_id])
);

-- CreateTable
CREATE TABLE [dbo].[banners] (
    [id] INT NOT NULL IDENTITY(1,1),
    [titulo] NVARCHAR(150) NOT NULL,
    [subtitulo] NVARCHAR(300),
    [imagen_url] NVARCHAR(500) NOT NULL,
    [texto_boton_primario] NVARCHAR(60),
    [url_boton_primario] NVARCHAR(300),
    [orden] INT NOT NULL CONSTRAINT [banners_orden_df] DEFAULT 0,
    [activo] BIT NOT NULL CONSTRAINT [banners_activo_df] DEFAULT 1,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [banners_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [banners_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[newsletter_subscribers] (
    [id] INT NOT NULL IDENTITY(1,1),
    [email] NVARCHAR(200) NOT NULL,
    [activo] BIT NOT NULL CONSTRAINT [newsletter_subscribers_activo_df] DEFAULT 1,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [newsletter_subscribers_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [newsletter_subscribers_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [newsletter_subscribers_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[contact_messages] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(150) NOT NULL,
    [email] NVARCHAR(200) NOT NULL,
    [asunto] NVARCHAR(200) NOT NULL,
    [mensaje] NVARCHAR(2000) NOT NULL,
    [leido] BIT NOT NULL CONSTRAINT [contact_messages_leido_df] DEFAULT 0,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [contact_messages_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [contact_messages_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[activity_logs] (
    [id] INT NOT NULL IDENTITY(1,1),
    [user_id] INT,
    [accion] NVARCHAR(200) NOT NULL,
    [detalle] NVARCHAR(1000),
    [created_at] DATETIME2 NOT NULL CONSTRAINT [activity_logs_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [activity_logs_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[audit_logs] (
    [id] INT NOT NULL IDENTITY(1,1),
    [entidad] NVARCHAR(100) NOT NULL,
    [entidad_id] INT NOT NULL,
    [accion] NVARCHAR(20) NOT NULL,
    [valores_previos] NVARCHAR(max),
    [valores_nuevos] NVARCHAR(max),
    [user_id] INT,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [audit_logs_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [audit_logs_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [users_role_id_idx] ON [dbo].[users]([role_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [products_category_id_idx] ON [dbo].[products]([category_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [products_brand_id_idx] ON [dbo].[products]([brand_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [products_slug_idx] ON [dbo].[products]([slug]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [product_images_product_id_idx] ON [dbo].[product_images]([product_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [orders_user_id_idx] ON [dbo].[orders]([user_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [reviews_product_id_aprobada_idx] ON [dbo].[reviews]([product_id], [aprobada]);

-- AddForeignKey
ALTER TABLE [dbo].[users] ADD CONSTRAINT [users_role_id_fkey] FOREIGN KEY ([role_id]) REFERENCES [dbo].[roles]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[products] ADD CONSTRAINT [products_category_id_fkey] FOREIGN KEY ([category_id]) REFERENCES [dbo].[categories]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[products] ADD CONSTRAINT [products_brand_id_fkey] FOREIGN KEY ([brand_id]) REFERENCES [dbo].[brands]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[products] ADD CONSTRAINT [products_promotion_id_fkey] FOREIGN KEY ([promotion_id]) REFERENCES [dbo].[promotions]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[product_images] ADD CONSTRAINT [product_images_product_id_fkey] FOREIGN KEY ([product_id]) REFERENCES [dbo].[products]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[inventory] ADD CONSTRAINT [inventory_product_id_fkey] FOREIGN KEY ([product_id]) REFERENCES [dbo].[products]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[orders] ADD CONSTRAINT [orders_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[order_details] ADD CONSTRAINT [order_details_order_id_fkey] FOREIGN KEY ([order_id]) REFERENCES [dbo].[orders]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[order_details] ADD CONSTRAINT [order_details_product_id_fkey] FOREIGN KEY ([product_id]) REFERENCES [dbo].[products]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[cart] ADD CONSTRAINT [cart_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[cart_items] ADD CONSTRAINT [cart_items_cart_id_fkey] FOREIGN KEY ([cart_id]) REFERENCES [dbo].[cart]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[cart_items] ADD CONSTRAINT [cart_items_product_id_fkey] FOREIGN KEY ([product_id]) REFERENCES [dbo].[products]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[reviews] ADD CONSTRAINT [reviews_product_id_fkey] FOREIGN KEY ([product_id]) REFERENCES [dbo].[products]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[reviews] ADD CONSTRAINT [reviews_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[favorites] ADD CONSTRAINT [favorites_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[favorites] ADD CONSTRAINT [favorites_product_id_fkey] FOREIGN KEY ([product_id]) REFERENCES [dbo].[products]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[activity_logs] ADD CONSTRAINT [activity_logs_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[audit_logs] ADD CONSTRAINT [audit_logs_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
