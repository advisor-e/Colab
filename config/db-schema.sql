-- ============================================================================
-- Advisor-e Collaborate — people-layer schema (MySQL 8 / InnoDB / utf8mb4)
-- ============================================================================
-- Advisor IDENTITY (name, title, firm, email, phone, location) is owned by
-- Advisory.com and is the system of record — it is NOT stored here. This schema
-- stores only the collaboration-specific data, keyed by the `advisor_id` that
-- Advisory issues. Provision this into the Advisor-e MySQL instance, then point
-- config/integration.js (DB section) / env vars at it.
-- ============================================================================

-- Advertised interest profile (platform-owned extension of the Advisory profile)
CREATE TABLE IF NOT EXISTS advisor_interest (
  advisor_id  VARCHAR(64)  NOT NULL PRIMARY KEY,
  available   TINYINT(1)   NOT NULL DEFAULT 0,
  about       TEXT         NULL,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Strengths / industries / topics the advisor advertises
CREATE TABLE IF NOT EXISTS advisor_tag (
  id          BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  advisor_id  VARCHAR(64)  NOT NULL,
  kind        ENUM('strength','industry','topic') NOT NULL,
  value       VARCHAR(120) NOT NULL,
  UNIQUE KEY uq_advisor_tag (advisor_id, kind, value),
  KEY idx_tag_value (kind, value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 1:1 connections (mutual accept)
CREATE TABLE IF NOT EXISTS connection (
  id            BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  requester_id  VARCHAR(64)  NOT NULL,
  addressee_id  VARCHAR(64)  NOT NULL,
  status        ENUM('pending','accepted','declined') NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_pair (requester_id, addressee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Groups (SIGs)
CREATE TABLE IF NOT EXISTS `group` (
  id           VARCHAR(80)  NOT NULL PRIMARY KEY,
  name         VARCHAR(160) NOT NULL,
  icon         VARCHAR(16)  NULL,
  created_by   VARCHAR(64)  NOT NULL,
  visibility   ENUM('listed','unlisted') NOT NULL DEFAULT 'listed',
  join_policy  ENUM('open','request-approval','invite-only') NOT NULL DEFAULT 'request-approval',
  summary      TEXT         NULL,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS group_tag (
  group_id VARCHAR(80)  NOT NULL,
  value    VARCHAR(120) NOT NULL,
  PRIMARY KEY (group_id, value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS group_member (
  group_id    VARCHAR(80) NOT NULL,
  advisor_id  VARCHAR(64) NOT NULL,
  role        ENUM('owner','admin','member') NOT NULL DEFAULT 'member',
  joined_at   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (group_id, advisor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Consent-based join requests (no auto-join; owner/manager approves)
CREATE TABLE IF NOT EXISTS group_join_request (
  id          BIGINT      NOT NULL AUTO_INCREMENT PRIMARY KEY,
  group_id    VARCHAR(80) NOT NULL,
  advisor_id  VARCHAR(64) NOT NULL,
  status      ENUM('requested','approved','declined') NOT NULL DEFAULT 'requested',
  created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_req (group_id, advisor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Conversation threads (outreach + group chats)
CREATE TABLE IF NOT EXISTS thread (
  id          VARCHAR(80)  NOT NULL PRIMARY KEY,
  kind        ENUM('outreach','group') NOT NULL,
  owner_id    VARCHAR(64)  NOT NULL,   -- whose inbox this thread belongs to
  with_id     VARCHAR(80)  NOT NULL,   -- the other advisor_id, or the group_id
  with_name   VARCHAR(160) NOT NULL,
  status      ENUM('request','active') NOT NULL DEFAULT 'active',
  direction   ENUM('incoming','outgoing') NOT NULL DEFAULT 'outgoing',
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_owner (owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS message (
  id           BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  thread_id    VARCHAR(80)  NOT NULL,
  sender_id    VARCHAR(64)  NOT NULL,
  sender_name  VARCHAR(160) NOT NULL,
  body         TEXT         NOT NULL,
  lang         VARCHAR(8)   NOT NULL DEFAULT 'en',
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_thread (thread_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
