BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[password_reset_tokens] (
    [id] INT NOT NULL IDENTITY(1,1),
    [user_id] INT NOT NULL,
    [token] NVARCHAR(128) NOT NULL,
    [expires_at] DATETIME2 NOT NULL,
    [used_at] DATETIME2,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [password_reset_tokens_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [password_reset_tokens_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [password_reset_tokens_token_key] UNIQUE NONCLUSTERED ([token])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [password_reset_tokens_user_id_idx] ON [dbo].[password_reset_tokens]([user_id]);

-- AddForeignKey
ALTER TABLE [dbo].[password_reset_tokens] ADD CONSTRAINT [password_reset_tokens_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
