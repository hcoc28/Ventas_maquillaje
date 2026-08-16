ALTER TABLE [dbo].[products] DROP CONSTRAINT [products_category_id_fkey];
ALTER TABLE [dbo].[products] DROP CONSTRAINT [products_brand_id_fkey];

ALTER TABLE [dbo].[products] ALTER COLUMN [category_id] INT NULL;
ALTER TABLE [dbo].[products] ALTER COLUMN [brand_id] INT NULL;

ALTER TABLE [dbo].[products] ADD CONSTRAINT [products_category_id_fkey] FOREIGN KEY ([category_id]) REFERENCES [dbo].[categories]([id]) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE [dbo].[products] ADD CONSTRAINT [products_brand_id_fkey] FOREIGN KEY ([brand_id]) REFERENCES [dbo].[brands]([id]) ON DELETE SET NULL ON UPDATE CASCADE;
