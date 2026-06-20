-- SQL Server Database Schema for Forestry Law Web App
-- Database Name: ForestryLawDB

-- Create Database if not exists
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'ForestryLawDB')
BEGIN
    CREATE DATABASE ForestryLawDB;
END
GO
USE ForestryLawDB;
GO

-- 1. Users Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Users] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [username] NVARCHAR(100) NOT NULL UNIQUE,
        [password] NVARCHAR(255) NOT NULL,
        [email] NVARCHAR(255) NOT NULL,
        [role] NVARCHAR(50) NOT NULL DEFAULT 'client', -- 'admin', 'lawyer', 'staff', 'client'
        [firstName] NVARCHAR(100) NULL,
        [lastName] NVARCHAR(100) NULL,
        [phoneNumber] NVARCHAR(50) NULL,
        [createdAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [updatedAt] DATETIME NOT NULL DEFAULT GETDATE()
    );
END;

-- 2. News Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[News]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[News] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [title] NVARCHAR(255) NOT NULL,
        [content] NVARCHAR(MAX) NOT NULL,
        [mediaUrl] NVARCHAR(1000) NULL,      -- Metadata for media (image or file links)
        [mediaType] NVARCHAR(50) NULL,      -- 'image', 'video', 'pdf', 'none'
        [createdAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [updatedAt] DATETIME NOT NULL DEFAULT GETDATE()
    );
END;

-- 3. Legal Documents Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[LegalDocuments]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[LegalDocuments] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [title] NVARCHAR(255) NOT NULL,
        [description] NVARCHAR(MAX) NULL,
        [documentNumber] NVARCHAR(100) NULL, -- Legal code/number
        [issueDate] DATETIME NULL,
        [fileUrl] NVARCHAR(1000) NULL,       -- Metadata for downloading files (PDF path)
        [fileType] NVARCHAR(50) NULL DEFAULT 'pdf',
        [createdAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [updatedAt] DATETIME NOT NULL DEFAULT GETDATE()
    );
END;

-- 4. Appointments Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Appointments]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Appointments] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [userId] INT NULL FOREIGN KEY REFERENCES [dbo].[Users]([id]), -- Link to user if logged in
        [clientName] NVARCHAR(255) NOT NULL,
        [clientEmail] NVARCHAR(255) NOT NULL,
        [clientPhone] NVARCHAR(50) NULL,
        [lawyerId] INT NULL FOREIGN KEY REFERENCES [dbo].[Users]([id]),  -- Assigned lawyer user ID
        [appointmentDate] DATETIME NOT NULL,
        [description] NVARCHAR(MAX) NULL,
        [status] NVARCHAR(50) NOT NULL DEFAULT 'Pending',                 -- 'Pending', 'Approved', 'Cancelled', 'Completed'
        [createdAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [updatedAt] DATETIME NOT NULL DEFAULT GETDATE()
    );
END;

-- ==========================================
-- AI Training & RAG Database Tables
-- ==========================================

-- 5. Drop existing AI Training tables if they exist (reverse dependency order)
IF OBJECT_ID('[dbo].[Points]', 'U') IS NOT NULL DROP TABLE [dbo].[Points];
IF OBJECT_ID('[dbo].[LegalUnits]', 'U') IS NOT NULL DROP TABLE [dbo].[LegalUnits];
IF OBJECT_ID('[dbo].[Clauses]', 'U') IS NOT NULL DROP TABLE [dbo].[Clauses];
IF OBJECT_ID('[dbo].[Articles]', 'U') IS NOT NULL DROP TABLE [dbo].[Articles];
IF OBJECT_ID('[dbo].[Sections]', 'U') IS NOT NULL DROP TABLE [dbo].[Sections];
IF OBJECT_ID('[dbo].[Chapters]', 'U') IS NOT NULL DROP TABLE [dbo].[Chapters];
IF OBJECT_ID('[dbo].[Documents]', 'U') IS NOT NULL DROP TABLE [dbo].[Documents];
GO

-- 6. AI Training Tables and Constraints

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- 6.1 Documents Table
CREATE TABLE [dbo].[Documents](
	[DocID] [nvarchar](50) NOT NULL,
	[Title] [nvarchar](500) NOT NULL,
	[EffectiveDate] [date] NULL,
	[Status] [nvarchar](100) NOT NULL,
 CONSTRAINT [PK_Documents] PRIMARY KEY CLUSTERED 
(
	[DocID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

-- 6.2 Chapters Table
CREATE TABLE [dbo].[Chapters](
	[ChapterID] [int] IDENTITY(1,1) NOT NULL,
	[DocID] [nvarchar](50) NOT NULL,
	[ChapterNumber] [nvarchar](10) NULL,
	[ChapterTitle] [nvarchar](500) NULL,
 CONSTRAINT [PK_Chapters] PRIMARY KEY CLUSTERED 
(
	[ChapterID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

-- 6.3 Sections Table
CREATE TABLE [dbo].[Sections](
	[SectionID] [int] IDENTITY(1,1) NOT NULL,
	[ChapterID] [int] NOT NULL,
	[SectionNumber] [nvarchar](10) NULL,
	[SectionTitle] [nvarchar](500) NULL,
 CONSTRAINT [PK_Sections] PRIMARY KEY CLUSTERED 
(
	[SectionID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

-- 6.4 Articles Table
CREATE TABLE [dbo].[Articles](
	[ArticleID] [int] IDENTITY(1,1) NOT NULL,
	[SectionID] [int] NULL,
	[ChapterID] [int] NULL,
	[ParentType] [nvarchar](20) NULL,
	[ArticleNumber] [nvarchar](20) NULL,
	[ArticleTitle] [nvarchar](500) NULL,
	[FullContent] [nvarchar](max) NULL,
 CONSTRAINT [PK_Articles] PRIMARY KEY CLUSTERED 
(
	[ArticleID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

-- 6.5 Clauses Table
CREATE TABLE [dbo].[Clauses](
	[ClauseID] [int] IDENTITY(1,1) NOT NULL,
	[ArticleID] [int] NOT NULL,
	[ClauseNumber] [nvarchar](10) NULL,
	[RawContent] [nvarchar](max) NULL,
	[EmbeddingContext] [nvarchar](max) NULL,
 CONSTRAINT [PK_Clauses] PRIMARY KEY CLUSTERED 
(
	[ClauseID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

-- 6.6 Points Table
CREATE TABLE [dbo].[Points](
	[PointID] [int] IDENTITY(1,1) NOT NULL,
	[ClauseID] [int] NOT NULL,
	[PointLetter] [nvarchar](10) NULL,
	[RawContent] [nvarchar](max) NULL,
	[EmbeddingContext] [nvarchar](max) NULL,
 CONSTRAINT [PK_Points] PRIMARY KEY CLUSTERED 
(
	[PointID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

-- 6.7 LegalUnits Table
CREATE TABLE [dbo].[LegalUnits](
	[UnitID] [int] IDENTITY(1,1) NOT NULL,
	[ArticleID] [int] NOT NULL,
	[ClauseNumber] [nvarchar](10) NULL,
	[PointLetter] [nvarchar](10) NULL,
	[RawContent] [nvarchar](max) NULL,
	[EmbeddingContext] [nvarchar](max) NULL,
 CONSTRAINT [PK_LegalUnits] PRIMARY KEY CLUSTERED 
(
	[UnitID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

-- 7. Indexes for AI Training Tables
SET ANSI_PADDING ON
GO

CREATE NONCLUSTERED INDEX [IX_Articles_Parent] ON [dbo].[Articles]
(
	[SectionID] ASC,
	[ChapterID] ASC,
	[ParentType] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

CREATE NONCLUSTERED INDEX [IX_Clauses_ArticleID] ON [dbo].[Clauses]
(
	[ArticleID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

SET ANSI_PADDING ON
GO

CREATE NONCLUSTERED INDEX [IX_Chapters_DocID] ON [dbo].[Chapters]
(
	[DocID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

SET ANSI_PADDING ON
GO

CREATE NONCLUSTERED INDEX [IX_Documents_Status] ON [dbo].[Documents]
(
	[Status] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

CREATE NONCLUSTERED INDEX [IX_LegalUnits_Article] ON [dbo].[LegalUnits]
(
	[ArticleID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

CREATE NONCLUSTERED INDEX [IX_Points_ClauseID] ON [dbo].[Points]
(
	[ClauseID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

CREATE NONCLUSTERED INDEX [IX_Sections_ChapterID] ON [dbo].[Sections]
(
	[ChapterID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

-- 8. Foreign Keys and Constraints for AI Training Tables

ALTER TABLE [dbo].[Documents] ADD CONSTRAINT [DF_Documents_Status] DEFAULT (N'Còn hiệu lực') FOR [Status]
GO

ALTER TABLE [dbo].[Articles] WITH CHECK ADD CONSTRAINT [FK_Articles_Sections] FOREIGN KEY([SectionID])
REFERENCES [dbo].[Sections] ([SectionID])
GO
ALTER TABLE [dbo].[Articles] CHECK CONSTRAINT [FK_Articles_Sections]
GO

ALTER TABLE [dbo].[Articles] WITH CHECK ADD CONSTRAINT [FK_Articles_Chapters] FOREIGN KEY([ChapterID])
REFERENCES [dbo].[Chapters] ([ChapterID])
GO
ALTER TABLE [dbo].[Articles] CHECK CONSTRAINT [FK_Articles_Chapters]
GO

ALTER TABLE [dbo].[Chapters] WITH CHECK ADD CONSTRAINT [FK_Chapters_DocID] FOREIGN KEY([DocID])
REFERENCES [dbo].[Documents] ([DocID])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Chapters] CHECK CONSTRAINT [FK_Chapters_DocID]
GO

ALTER TABLE [dbo].[LegalUnits] WITH CHECK ADD CONSTRAINT [FK_LegalUnits_ArticleID] FOREIGN KEY([ArticleID])
REFERENCES [dbo].[Articles] ([ArticleID])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[LegalUnits] CHECK CONSTRAINT [FK_LegalUnits_ArticleID]
GO

ALTER TABLE [dbo].[Points] WITH CHECK ADD CONSTRAINT [FK_Points_ClauseID] FOREIGN KEY([ClauseID])
REFERENCES [dbo].[Clauses] ([ClauseID])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Points] CHECK CONSTRAINT [FK_Points_ClauseID]
GO

ALTER TABLE [dbo].[Sections] WITH CHECK ADD CONSTRAINT [FK_Sections_ChapterID] FOREIGN KEY([ChapterID])
REFERENCES [dbo].[Chapters] ([ChapterID])
GO
ALTER TABLE [dbo].[Sections] CHECK CONSTRAINT [FK_Sections_ChapterID]
GO

ALTER TABLE [dbo].[Articles] WITH CHECK ADD CONSTRAINT [CK_Articles_ParentType] CHECK (
    ([ParentType] IS NULL) OR 
    ([ParentType] = N'SECTION' AND [SectionID] IS NOT NULL AND [ChapterID] IS NULL) OR 
    ([ParentType] = N'CHAPTER' AND [ChapterID] IS NOT NULL AND [SectionID] IS NULL)
)
GO
ALTER TABLE [dbo].[Articles] CHECK CONSTRAINT [CK_Articles_ParentType]
GO
