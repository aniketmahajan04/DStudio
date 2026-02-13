// --- Better-Auth Required Models ---

model User {
id String @id @default(cuid())
name String
email String @unique
emailVerified Boolean
image String?
role Role @default(USER) // Added your custom Role
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

// Relations to your custom logic
sessions Session[]
accounts Account[]
connections Connection[]
savedQueries SavedQuery[]

@@map("user")
}

model Session {
id String @id @default(cuid())
expiresAt DateTime
token String @unique
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
ipAddress String?
userAgent String?
userId String
user User @relation(fields: [userId], references: [id], onDelete: Cascade)

@@map("session")
}

model Account {
id String @id @default(cuid())
accountId String
providerId String
userId String
user User @relation(fields: [userId], references: [id], onDelete: Cascade)
accessToken String?
refreshToken String?
idToken String?
accessTokenExpiresAt DateTime?
refreshTokenExpiresAt DateTime?
scope String?
password String?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

@@map("account")
}

model Verification {
id String @id @default(cuid())
identifier String
value String
expiresAt DateTime
createdAt DateTime?
updatedAt DateTime?

@@map("verification")
}

// --- Your Business Logic Models ---

model Connection {
id String @id @default(cuid())
connectionName String @map("connection_name")
type DbType
connectionUrl String @map("connection_url") // Encrypted string
iv String // For AES-256-GCM decryption
createdAt DateTime @default(now())

userId String
user User @relation(fields: [userId], references: [id], onDelete: Cascade)
history History[]

@@map("connections")
}

model History {
id String @id @default(cuid())
sqlQuery String @map("sql_query")
status Status
executedTime Int @map("executed_time") // Store in ms
errorMessage String? @map("error_message")
createdAt DateTime @default(now())

connectionId String @map("connection_id")
connection Connection @relation(fields: [connectionId], references: [id], onDelete: Cascade)

@@map("history")
}

model SavedQuery {
id String @id @default(cuid())
name String @map("query_name")
sqlQuery String @map("sql_query")
dbType DbType @map("db_type")
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

userId String
user User @relation(fields: [userId], references: [id], onDelete: Cascade)

@@map("saved_queries")
}

// --- Enums ---

enum Role {
USER
ADMIN
}

enum DbType {
POSTGRES
MYSQL
SQLITE
}

enum Status {
SUCCESS
FAILED
}
