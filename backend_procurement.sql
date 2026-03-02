CREATE DATABASE  IF NOT EXISTS `backend_procurement` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `backend_procurement`;
-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: backend_procurement
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `items`
--

DROP TABLE IF EXISTS `items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `purchase_request_id` bigint unsigned NOT NULL,
  `item_no` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stock_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `item_description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `item_inclusions` text COLLATE utf8mb4_unicode_ci,
  `quantity` decimal(12,2) NOT NULL,
  `unit_cost` decimal(15,2) NOT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `items_purchase_request_id_foreign` (`purchase_request_id`),
  CONSTRAINT `items_purchase_request_id_foreign` FOREIGN KEY (`purchase_request_id`) REFERENCES `purchase_requests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `items`
--

LOCK TABLES `items` WRITE;
/*!40000 ALTER TABLE `items` DISABLE KEYS */;
INSERT INTO `items` VALUES (1,1,'1','STK-4232','set','Updated printer ink bundle','Standard package',8.00,3000.00,0,'2026-02-25 16:28:26','2026-02-25 17:00:04'),(2,1,'2','STK-7713','set','Generated item 2 for PR-2026-000001','Standard package',37.00,42239.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(3,2,'1','STK-5497','box','Generated item 1 for PR-2026-000002','Standard package',38.00,14881.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(4,2,'2','STK-7124','set','Generated item 2 for PR-2026-000002','Standard package',24.00,42661.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(5,2,'3','STK-4702','set','Generated item 3 for PR-2026-000002','Standard package',11.00,49321.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(6,3,'1','STK-8956','box','Generated item 1 for PR-2026-000003','Standard package',26.00,44165.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(7,3,'2','STK-9785','pcs','Generated item 2 for PR-2026-000003','Standard package',46.00,24585.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(8,3,'3','STK-5242','pcs','Generated item 3 for PR-2026-000003','Standard package',40.00,21685.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(9,4,'1','STK-8147','set','Generated item 1 for PR-2026-000004','Standard package',5.00,24513.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(10,4,'2','STK-7028','pcs','Generated item 2 for PR-2026-000004','Standard package',16.00,25668.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(11,4,'3','STK-1233','pcs','Generated item 3 for PR-2026-000004','Standard package',23.00,17379.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(12,5,'1','STK-1914','box','Generated item 1 for PR-2026-000005','Standard package',32.00,37171.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(13,6,'1','STK-8083','set','Generated item 1 for PR-2026-000006','Standard package',5.00,49510.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(14,6,'2','STK-1775','pcs','Generated item 2 for PR-2026-000006','Standard package',20.00,15845.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(15,7,'1','STK-9890','set','Generated item 1 for PR-2026-000007','Standard package',26.00,2199.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(16,7,'2','STK-7668','pcs','Generated item 2 for PR-2026-000007','Standard package',10.00,22961.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(17,7,'3','STK-3959','set','Generated item 3 for PR-2026-000007','Standard package',46.00,42501.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(18,8,'1','STK-8451','box','Generated item 1 for PR-2026-000008','Standard package',15.00,17157.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(19,9,'1','STK-2327','box','Generated item 1 for PR-2026-000009','Standard package',28.00,41168.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(20,9,'2','STK-6242','set','Generated item 2 for PR-2026-000009','Standard package',23.00,10016.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(21,9,'3','STK-5012','set','Generated item 3 for PR-2026-000009','Standard package',3.00,2229.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(22,10,'1','STK-8584','pcs','Generated item 1 for PR-2026-000010','Standard package',20.00,25467.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(23,10,'2','STK-8907','set','Generated item 2 for PR-2026-000010','Standard package',28.00,10849.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(24,10,'3','STK-2596','box','Generated item 3 for PR-2026-000010','Standard package',50.00,4570.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(25,11,'1','STK-9700','box','Generated item 1 for PR-2026-000011','Standard package',7.00,23635.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(26,11,'2','STK-1543','pcs','Generated item 2 for PR-2026-000011','Standard package',3.00,2344.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(27,12,'1','STK-8222','box','Generated item 1 for PR-2026-000012','Standard package',42.00,13559.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(28,12,'2','STK-4906','box','Generated item 2 for PR-2026-000012','Standard package',49.00,6721.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(29,12,'3','STK-2593','pcs','Generated item 3 for PR-2026-000012','Standard package',37.00,43773.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(30,12,'4','STK-3320','pcs','Generated item 4 for PR-2026-000012','Standard package',22.00,38141.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(31,13,'1','STK-6762','pcs','Generated item 1 for PR-2026-000013','Standard package',13.00,47960.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(32,13,'2','STK-3643','box','Generated item 2 for PR-2026-000013','Standard package',48.00,14405.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(33,14,'1','STK-3658','pcs','Generated item 1 for PR-2026-000014','Standard package',12.00,17696.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(34,14,'2','STK-1279','box','Generated item 2 for PR-2026-000014','Standard package',31.00,36305.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(35,14,'3','STK-9300','box','Generated item 3 for PR-2026-000014','Standard package',25.00,39920.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(36,15,'1','STK-5281','box','Generated item 1 for PR-2026-000015','Standard package',25.00,47493.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(37,15,'2','STK-7638','pcs','Generated item 2 for PR-2026-000015','Standard package',44.00,14235.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(38,16,'1','STK-2667','box','Generated item 1 for PR-2026-000016','Standard package',7.00,12752.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(39,17,'1','STK-3273','set','Generated item 1 for PR-2026-000017','Standard package',21.00,34750.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(40,17,'2','STK-4627','box','Generated item 2 for PR-2026-000017','Standard package',38.00,41200.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(41,17,'3','STK-6357','pcs','Generated item 3 for PR-2026-000017','Standard package',45.00,28740.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(42,18,'1','STK-4065','pcs','Generated item 1 for PR-2026-000018','Standard package',43.00,48973.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(43,18,'2','STK-8319','set','Generated item 2 for PR-2026-000018','Standard package',26.00,10102.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(44,19,'1','STK-2269','set','Generated item 1 for PR-2026-000019','Standard package',21.00,45453.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(45,19,'2','STK-4514','set','Generated item 2 for PR-2026-000019','Standard package',37.00,13082.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(46,19,'3','STK-6679','box','Generated item 3 for PR-2026-000019','Standard package',21.00,8559.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(47,20,'1','STK-7602','set','Generated item 1 for PR-2026-000020','Standard package',4.00,39518.00,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(48,21,'1','STK-1001','pcs','Ergonomic office chair','Lumbar support, wheels',10.00,5500.75,0,'2026-02-25 16:49:32','2026-02-25 16:49:32'),(49,1,'2','STK-2002','box','Printer Ink','Black + Color',5.00,3200.00,0,'2026-02-25 16:59:41','2026-02-25 16:59:41'),(50,22,'1','STK-1001','pcs','Test item','Sample inclusion',2.00,1000.00,0,'2026-03-01 22:42:40','2026-03-01 22:42:40');
/*!40000 ALTER TABLE `items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `login_otps`
--

DROP TABLE IF EXISTS `login_otps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `login_otps` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `attempts` tinyint unsigned NOT NULL DEFAULT '0',
  `consumed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `login_otps_email_index` (`email`),
  KEY `login_otps_expires_at_index` (`expires_at`),
  KEY `login_otps_consumed_at_index` (`consumed_at`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login_otps`
--

LOCK TABLES `login_otps` WRITE;
/*!40000 ALTER TABLE `login_otps` DISABLE KEYS */;
INSERT INTO `login_otps` VALUES (1,'grantarachea@gmail.com','$2y$12$TaZrzFOuVbjPe8p6FPeqSupkxmksOjrrI9MHfpHkBuoxPoeHsfRKS','2026-02-24 21:15:30',0,'2026-02-24 21:11:42','2026-02-24 21:10:30','2026-02-24 21:11:42'),(2,'grantarachea@gmail.com','$2y$12$lKhIApuu/M0UKdS9F2g9H.IRVvZGCgpbMKTBX9jeB4QCrACpcOHMS','2026-02-24 21:36:10',1,'2026-02-24 21:32:27','2026-02-24 21:31:10','2026-02-24 21:32:27'),(3,'grantarachea@gmail.com','$2y$12$/XqFfgRjTe1TcBjCrcKpveaXyuLnz/aMKSF3TUjod/BDd6n4i0HlW','2026-02-24 22:13:50',0,'2026-02-24 22:09:29','2026-02-24 22:08:50','2026-02-24 22:09:29'),(4,'grantarachea09@gmail.com','$2y$12$7agMu1ohgD9wgq7zInsm6.Vg.uLwO8qIjDHmR1I1VHuiHRvgexzli','2026-02-24 22:32:43',0,'2026-02-24 22:28:39','2026-02-24 22:27:43','2026-02-24 22:28:39'),(5,'grantarachea09@gmail.com','$2y$12$mWRYXFAhZ9Jt7/U95ZICdOC.VSVbbRLOoLoge/J850hB9vwuOGDgu','2026-02-24 22:46:15',3,'2026-02-24 22:53:51','2026-02-24 22:41:15','2026-02-24 22:53:51'),(6,'grantarachea@gmail.com','$2y$12$ZC1OlgivhFpFHyk6TfU0YuSrmXFwpIfT5d8VJKsmYGVboLNjS/Ahy','2026-02-24 22:48:17',0,'2026-02-24 22:43:52','2026-02-24 22:43:17','2026-02-24 22:43:52'),(7,'grantarachea09@gmail.com','$2y$12$22IV/WYpNovEG239hivP1O/f4rkGDBwRM3X8UP9Y6A7Fn9PNN/Rwy','2026-02-24 22:58:52',0,'2026-02-24 22:54:41','2026-02-24 22:53:52','2026-02-24 22:54:41'),(8,'grantarachea@gmail.com','$2y$12$WXv15rSsPe81FBi2315IX.yY8u9Nfr9FJZ8GYw1NnXlvrDcnKU5Ee','2026-02-25 16:14:09',0,'2026-02-25 16:10:17','2026-02-25 16:09:09','2026-02-25 16:10:17'),(9,'grantarachea@gmail.com','$2y$12$K0OvBA2I2v57rv6Cx1rFNOoxwVd5qinnbOJdvka6xZMbYScrwx4pW','2026-02-25 16:50:48',0,'2026-02-25 16:46:42','2026-02-25 16:45:48','2026-02-25 16:46:42'),(10,'grantarachea@gmail.com','$2y$12$p8AAe6dyd8Qz0cJmvjfen.CfOwkm7Fgp5U5xrYklV1UjatvkQIR16','2026-03-01 18:41:27',0,'2026-03-01 18:36:51','2026-03-01 18:36:27','2026-03-01 18:36:51'),(11,'grantarachea@gmail.com','$2y$12$gB/giGjERrw7XVWkDwtFL..n.bhXNdCzpdIKPh3gJsCWhNjMPv0Vm','2026-03-01 22:24:40',0,'2026-03-01 22:20:16','2026-03-01 22:19:40','2026-03-01 22:20:16'),(12,'grantarachea@gmail.com','$2y$12$vUTPT3WkjetyPfoVUDZ1MuSlmiUW8CdV9hb0AuGCRvULDObKRMOrW','2026-03-01 22:25:16',0,'2026-03-01 22:20:44','2026-03-01 22:20:16','2026-03-01 22:20:44');
/*!40000 ALTER TABLE `login_otps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'2026_02_23_051036_login_otps_table',1),(3,'2026_02_25_000311_create_roles_table',1),(4,'2026_02_25_010510_create_notifications_table',1),(5,'2026_02_25_013709_create_procurements_table',1),(6,'2026_02_25_014143_create_procurement_pdfs_table',1),(7,'2026_02_26_120000_create_purchase_requests_table',2),(8,'2026_02_26_120100_create_items_table',2),(9,'2026_02_26_130000_add_deleted_flags_to_purchase_requests_and_items',3),(10,'2026_03_02_100000_create_projects_table',4),(11,'2026_03_02_100100_create_procurement_modes_table',4),(12,'2026_03_02_100200_add_project_and_mode_fk_to_procurements_table',4),(13,'2026_03_02_101000_drop_legacy_project_and_mode_columns_from_procurements',5);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `data` json DEFAULT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_user_id_foreign` (`user_id`),
  CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,2,'procurement_submitted','New Procurement Submitted','GRANT ARACHEA submitted procurement PR-2026-000003 for review.','{\"status\": \"pending\", \"requested_by\": 1, \"procurement_id\": 3, \"procurement_no\": \"PR-2026-000003\"}',NULL,'2026-02-24 22:14:42','2026-02-24 22:14:42'),(2,1,'procurement_accepted','Procurement Status Updated','Your procurement PR-2026-000001 changed from pending to accepted.','{\"new_status\": \"accepted\", \"old_status\": \"pending\", \"procurement_id\": 1, \"procurement_no\": \"PR-2026-000001\"}',NULL,'2026-02-24 22:29:12','2026-02-24 22:29:12'),(3,1,'procurement_rejected','Procurement Status Updated','Your procurement PR-2026-000002 changed from pending to rejected.','{\"new_status\": \"rejected\", \"old_status\": \"pending\", \"procurement_id\": 2, \"procurement_no\": \"PR-2026-000002\"}',NULL,'2026-02-24 22:29:24','2026-02-24 22:29:24'),(4,2,'procurement_submitted','New Procurement Submitted','GRANT ARACHEA submitted procurement PR-2026-000021 for review.','{\"status\": \"pending\", \"requested_by\": 1, \"procurement_id\": 21, \"procurement_no\": \"PR-2026-000021\"}',NULL,'2026-02-25 16:49:32','2026-02-25 16:49:32'),(5,2,'procurement_submitted','New Procurement Submitted','GRANT ARACHEA submitted procurement PR-2026-000022 for review.','{\"status\": \"pending\", \"requested_by\": 1, \"procurement_id\": 22, \"procurement_no\": \"PR-2026-000022\"}',NULL,'2026-03-01 22:42:40','2026-03-01 22:42:40');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `procurement_modes`
--

DROP TABLE IF EXISTS `procurement_modes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `procurement_modes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `legal_basis` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'RA 12009',
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `procurement_modes_name_unique` (`name`),
  UNIQUE KEY `procurement_modes_code_unique` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `procurement_modes`
--

LOCK TABLES `procurement_modes` WRITE;
/*!40000 ALTER TABLE `procurement_modes` DISABLE KEYS */;
INSERT INTO `procurement_modes` VALUES (1,'CB','Competitive Bidding','RA 12009',NULL,1,'2026-03-01 22:02:55','2026-03-01 22:02:55'),(2,'LSB','Limited Source Bidding','RA 12009',NULL,1,'2026-03-01 22:02:55','2026-03-01 22:02:55'),(3,'CD','Competitive Dialogue','RA 12009',NULL,1,'2026-03-01 22:02:55','2026-03-01 22:02:55'),(4,'UOBM','Unsolicited Offer with Bid Matching','RA 12009',NULL,1,'2026-03-01 22:02:55','2026-03-01 22:02:55'),(5,'DC','Direct Contracting','RA 12009',NULL,1,'2026-03-01 22:02:55','2026-03-01 22:02:55'),(6,'RO','Repeat Order','RA 12009',NULL,1,'2026-03-01 22:02:55','2026-03-01 22:02:55'),(7,'SMP','Small Value Procurement','RA 12009',NULL,1,'2026-03-01 22:02:55','2026-03-01 22:02:55'),(8,'NP','Negotiated Procurement','RA 12009',NULL,1,'2026-03-01 22:18:44','2026-03-01 22:18:44'),(9,'DS','Direct Sales','RA 12009',NULL,1,'2026-03-01 22:18:44','2026-03-01 22:18:44'),(10,'DPSTI','Direct Procurement for Science, Technology, and Innovation','RA 12009',NULL,1,'2026-03-01 22:18:44','2026-03-01 22:18:44'),(11,'DA','Direct Acquisition','RA 12009',NULL,1,'2026-03-01 22:18:44','2026-03-01 22:18:44');
/*!40000 ALTER TABLE `procurement_modes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `procurement_pdfs`
--

DROP TABLE IF EXISTS `procurement_pdfs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `procurement_pdfs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `procurement_id` bigint unsigned NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checklist` json NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `procurement_pdfs_procurement_id_foreign` (`procurement_id`),
  CONSTRAINT `procurement_pdfs_procurement_id_foreign` FOREIGN KEY (`procurement_id`) REFERENCES `procurements` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `procurement_pdfs`
--

LOCK TABLES `procurement_pdfs` WRITE;
/*!40000 ALTER TABLE `procurement_pdfs` DISABLE KEYS */;
INSERT INTO `procurement_pdfs` VALUES (1,1,'request-form.pdf','procurements/1/oswuVSrEcjqWe8gzUU0MmZoEIk1blG6QXYFekOQf.pdf','{\"signed\": \"true\", \"quotation_attached\": \"false\"}','2026-02-24 21:45:51','2026-02-24 21:45:51'),(2,21,'hahah.pdf','procurements/21/EQpNtfGd40kyYbG27gTgKBIzo7HlQvBnLmh6ak6e.pdf','{\"signed\": true, \"remarks\": \"initial upload\", \"complete\": true}','2026-02-25 16:52:19','2026-02-25 16:52:19');
/*!40000 ALTER TABLE `procurement_pdfs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `procurements`
--

DROP TABLE IF EXISTS `procurements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `procurements` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `procurement_no` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `procurement_mode_id` bigint unsigned DEFAULT NULL,
  `project_id` bigint unsigned DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `description` text COLLATE utf8mb4_unicode_ci,
  `requested_by` bigint unsigned NOT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `procurements_procurement_no_unique` (`procurement_no`),
  KEY `procurements_requested_by_foreign` (`requested_by`),
  KEY `procurements_procurement_mode_id_foreign` (`procurement_mode_id`),
  KEY `procurements_project_id_procurement_mode_id_index` (`project_id`,`procurement_mode_id`),
  CONSTRAINT `procurements_procurement_mode_id_foreign` FOREIGN KEY (`procurement_mode_id`) REFERENCES `procurement_modes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `procurements_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
  CONSTRAINT `procurements_requested_by_foreign` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `procurements`
--

LOCK TABLES `procurements` WRITE;
/*!40000 ALTER TABLE `procurements` DISABLE KEYS */;
INSERT INTO `procurements` VALUES (1,'PR-2026-000001','Office Chairs',5,1,'accepted','Need 20 ergonomic chairs',1,0,'2026-02-24 21:12:46','2026-02-24 22:29:12'),(2,'PR-2026-000002','Office Chairs Retest',5,1,'rejected','Retest procurement creation',1,0,'2026-02-24 21:40:36','2026-02-24 22:29:24'),(3,'PR-2026-000003','Test Notification PR',5,2,'pending','testing',1,0,'2026-02-24 22:14:42','2026-02-24 22:14:42'),(4,'PR-2026-000004','Office Supply Batch #4',3,3,'ongoing','Generated sample procurement record #4',1,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(5,'PR-2026-000005','Office Supply Batch #5',5,4,'approved','Generated sample procurement record #5',1,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(6,'PR-2026-000006','Office Supply Batch #6',5,4,'approved','Generated sample procurement record #6',1,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(7,'PR-2026-000007','Office Supply Batch #7',3,4,'approved','Generated sample procurement record #7',1,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(8,'PR-2026-000008','Office Supply Batch #8',3,3,'ongoing','Generated sample procurement record #8',1,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(9,'PR-2026-000009','Office Supply Batch #9',5,5,'approved','Generated sample procurement record #9',1,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(10,'PR-2026-000010','Office Supply Batch #10',5,3,'pending','Generated sample procurement record #10',1,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(11,'PR-2026-000011','Office Supply Batch #11',7,4,'approved','Generated sample procurement record #11',1,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(12,'PR-2026-000012','Office Supply Batch #12',5,3,'pending','Generated sample procurement record #12',1,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(13,'PR-2026-000013','Office Supply Batch #13',5,3,'pending','Generated sample procurement record #13',3,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(14,'PR-2026-000014','Office Supply Batch #14',7,5,'pending','Generated sample procurement record #14',3,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(15,'PR-2026-000015','Office Supply Batch #15',5,4,'approved','Generated sample procurement record #15',3,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(16,'PR-2026-000016','Office Supply Batch #16',3,5,'approved','Generated sample procurement record #16',3,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(17,'PR-2026-000017','Office Supply Batch #17',3,5,'pending','Generated sample procurement record #17',3,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(18,'PR-2026-000018','Office Supply Batch #18',3,5,'ongoing','Generated sample procurement record #18',3,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(19,'PR-2026-000019','Office Supply Batch #19',7,4,'pending','Generated sample procurement record #19',3,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(20,'PR-2026-000020','Office Supply Batch #20',5,5,'pending','Generated sample procurement record #20',3,0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(21,'PR-2026-000021','Updated Procurement Title',5,6,'pending','Updated notes',3,0,'2026-02-25 16:49:32','2026-02-25 16:50:17'),(22,'PR-2026-000022','Test Procurement via Postman',4,21,'pending','Testing FK-only procurement',3,0,'2026-03-01 22:42:40','2026-03-01 22:42:40');
/*!40000 ALTER TABLE `procurements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `projects_name_unique` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
INSERT INTO `projects` VALUES (1,'Free WI-FI for all',NULL,1,'2026-03-01 22:02:55','2026-03-01 22:02:55'),(2,'Government Network',NULL,1,'2026-03-01 22:02:55','2026-03-01 22:02:55'),(3,'National Broadband Program',NULL,1,'2026-03-01 22:02:55','2026-03-01 22:02:55'),(4,'Government Emergency Communication System',NULL,1,'2026-03-01 22:02:55','2026-03-01 22:02:55'),(5,'eReport',NULL,1,'2026-03-01 22:02:55','2026-03-01 22:02:55'),(6,'eGOVPH',NULL,1,'2026-03-01 22:02:55','2026-03-01 22:02:55'),(7,'eLGU-iBPLS',NULL,1,'2026-03-01 22:18:44','2026-03-01 22:18:44'),(8,'eTRAVEL',NULL,1,'2026-03-01 22:18:44','2026-03-01 22:18:44'),(9,'eGovCloud',NULL,1,'2026-03-01 22:18:44','2026-03-01 22:18:44'),(10,'eGovPay',NULL,1,'2026-03-01 22:18:44','2026-03-01 22:18:44'),(11,'ICT Literacy and Competency development Bureau',NULL,1,'2026-03-01 22:18:44','2026-03-01 22:18:44'),(12,'SPARK',NULL,1,'2026-03-01 22:18:44','2026-03-01 22:18:44'),(13,'TECH4ED-DTC',NULL,1,'2026-03-01 22:18:44','2026-03-01 22:18:44'),(14,'Cybersecurity Awareness',NULL,1,'2026-03-01 22:18:44','2026-03-01 22:18:44'),(15,'National Government Portal',NULL,1,'2026-03-01 22:18:44','2026-03-01 22:18:44'),(16,'PNPKI',NULL,1,'2026-03-01 22:18:44','2026-03-01 22:18:44'),(17,'ICT Industry Development Bureau',NULL,1,'2026-03-01 22:18:44','2026-03-01 22:18:44'),(18,'Digital Governance Award',NULL,1,'2026-03-01 22:18:44','2026-03-01 22:18:44'),(19,'Digital Cities',NULL,1,'2026-03-01 22:18:44','2026-03-01 22:18:44'),(20,'Digiral Startup Development and Acceleration Program',NULL,1,'2026-03-01 22:18:44','2026-03-01 22:18:44'),(21,'DVAS',NULL,1,'2026-03-01 22:18:44','2026-03-01 22:18:44');
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_requests`
--

DROP TABLE IF EXISTS `purchase_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_requests` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `procurement_id` bigint unsigned NOT NULL,
  `purchase_request_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `office` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_created` date NOT NULL,
  `responsibility_center_code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `purpose` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `purchase_requests_procurement_id_unique` (`procurement_id`),
  UNIQUE KEY `purchase_requests_purchase_request_number_unique` (`purchase_request_number`),
  CONSTRAINT `purchase_requests_procurement_id_foreign` FOREIGN KEY (`procurement_id`) REFERENCES `procurements` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_requests`
--

LOCK TABLES `purchase_requests` WRITE;
/*!40000 ALTER TABLE `purchase_requests` DISABLE KEYS */;
INSERT INTO `purchase_requests` VALUES (1,1,'PUR-2026-000001','Engineering Office','2026-02-27','RCC-009','Updated purchase request purpose',0,'2026-02-25 16:28:26','2026-02-25 16:58:44'),(2,2,'PUR-2026-000002','Engineering Office','2026-02-08','RCC-112','Generated purchase request for Facilities Upgrade',0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(3,3,'PUR-2026-000003','Admin Office','2026-02-13','RCC-152','Generated purchase request for Notification Test',0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(4,4,'PUR-2026-000004','ICT Office','2026-02-18','RCC-651','Generated purchase request for IT Infrastructure',0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(5,5,'PUR-2026-000005','ICT Office','2026-02-19','RCC-926','Generated purchase request for Office Upgrade',0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(6,6,'PUR-2026-000006','Engineering Office','2026-02-10','RCC-229','Generated purchase request for Office Upgrade',0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(7,7,'PUR-2026-000007','Admin Office','2026-02-03','RCC-409','Generated purchase request for Office Upgrade',0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(8,8,'PUR-2026-000008','Budget Office','2026-02-23','RCC-271','Generated purchase request for IT Infrastructure',0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(9,9,'PUR-2026-000009','General Services','2026-02-23','RCC-813','Generated purchase request for Facilities Maintenance',0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(10,10,'PUR-2026-000010','Budget Office','2026-01-31','RCC-076','Generated purchase request for IT Infrastructure',0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(11,11,'PUR-2026-000011','General Services','2026-02-25','RCC-405','Generated purchase request for Office Upgrade',0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(12,12,'PUR-2026-000012','Engineering Office','2026-02-18','RCC-387','Generated purchase request for IT Infrastructure',0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(13,13,'PUR-2026-000013','General Services','2026-02-11','RCC-608','Generated purchase request for IT Infrastructure',0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(14,14,'PUR-2026-000014','Engineering Office','2026-02-24','RCC-865','Generated purchase request for Facilities Maintenance',0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(15,15,'PUR-2026-000015','ICT Office','2026-01-29','RCC-162','Generated purchase request for Office Upgrade',0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(16,16,'PUR-2026-000016','Admin Office','2026-02-26','RCC-596','Generated purchase request for Facilities Maintenance',0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(17,17,'PUR-2026-000017','Admin Office','2026-02-05','RCC-863','Generated purchase request for Facilities Maintenance',0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(18,18,'PUR-2026-000018','ICT Office','2026-02-25','RCC-555','Generated purchase request for Facilities Maintenance',0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(19,19,'PUR-2026-000019','Admin Office','2026-02-05','RCC-416','Generated purchase request for Office Upgrade',0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(20,20,'PUR-2026-000020','Budget Office','2026-02-16','RCC-374','Generated purchase request for Facilities Maintenance',0,'2026-02-25 16:28:26','2026-02-25 16:28:26'),(21,21,'PUR-2026-000021','Admin Office','2026-02-26','RCC-001','Office seating replacement',0,'2026-02-25 16:49:32','2026-02-25 16:49:32'),(22,22,'PUR-2026-000022','Admin Office','2026-03-02','RCC-001','System test',0,'2026-03-01 22:42:40','2026-03-01 22:42:40');
/*!40000 ALTER TABLE `purchase_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `role_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `designation` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `position` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'focal','chairperson','ojt','user','2026-02-24 21:09:10','2026-02-24 21:09:10'),(2,'adq','chair','ojt','Budget Officer','2026-02-24 21:09:10','2026-02-24 21:09:10'),(3,'adq','chair','ojt','user','2026-02-24 21:09:10','2026-02-24 21:09:10');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('5wwn3r85SnS8rGTIK8Z8TDozyOBQ732KpvD19uvK',1,'127.0.0.1','PostmanRuntime/7.51.1','YTo0OntzOjY6Il90b2tlbiI7czo0MDoiVnMyUGhFWkd3Z0NyYWpwcjVTb1FZRzJnMGpTYnpQQWUwbVFsMHNZNSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MTtzOjk6Il9wcmV2aW91cyI7YToyOntzOjM6InVybCI7czo0NzoiaHR0cDovLzEyNy4wLjAuMTo4MDAwL3Byb2N1cmVtZW50cy9zZWFyY2g/cT1raW0iO3M6NToicm91dGUiO047fX0=',1772435730),('aVBedwYq33J2AhHG5G846FlXPbMuS4v6govJVM9s',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiMTJUbEZQMjl4STRLbDlKNTNETjdqSFRCTE5hcDdKN3pwZ2FJSGhSciI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1772414929),('vtUEinciU50Z0wJn8u2nVhfSGoCkx3kUtjDHGByg',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiOWpwOUdDbVF6ZTdKSmM4NnhkaGNZbmZacUtRejM4bFdMRzNSbzA3ViI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1772414928);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `last_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `middle_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `access_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` bigint unsigned DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `is_authorized` tinyint(1) NOT NULL DEFAULT '1',
  `active_session_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `active_device_fingerprint` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_username_unique` (`username`),
  KEY `users_role_id_index` (`role_id`),
  KEY `users_active_session_id_index` (`active_session_id`),
  CONSTRAINT `users_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'ARACHEA','GRANT','liwanag','grantarachea@gmail.com','hey','user',1,1,1,'5wwn3r85SnS8rGTIK8Z8TDozyOBQ732KpvD19uvK','8ae1e060b74b9ba4317a7197c1e1f1311c940063092506dad797bde2e847d2bf',NULL,'2026-02-24 21:09:10','2026-03-01 22:20:44'),(2,'OfficerTwo','Budget',NULL,'grantarachea09@gmail.com','budget.officer2','budget_officer',2,1,1,'nvnbaN4tHhSJVGlCi9OJkPOUKmP4tvsXyJPEiR3X','c0dea510547aa0374f156589f64c513b66b9c095b96ad11ef6794dcf088ce889',NULL,'2026-02-24 22:02:55','2026-02-24 22:54:41'),(3,'Aspa','Kimberly','Catalma','aspakimberly@gmail.com','kimz','user',3,1,1,NULL,NULL,NULL,'2026-02-24 22:02:55','2026-02-24 22:54:41');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-02 15:19:32
