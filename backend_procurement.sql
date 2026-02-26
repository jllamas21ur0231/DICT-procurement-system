-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 26, 2026 at 09:19 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `backend_procurement`
--

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `purchase_request_id` bigint(20) UNSIGNED NOT NULL,
  `item_no` varchar(50) NOT NULL,
  `stock_no` varchar(100) DEFAULT NULL,
  `unit` varchar(50) NOT NULL,
  `item_description` text NOT NULL,
  `item_inclusions` text DEFAULT NULL,
  `quantity` decimal(12,2) NOT NULL,
  `unit_cost` decimal(15,2) NOT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`id`, `purchase_request_id`, `item_no`, `stock_no`, `unit`, `item_description`, `item_inclusions`, `quantity`, `unit_cost`, `deleted`, `created_at`, `updated_at`) VALUES
(1, 1, '1', 'STK-4232', 'set', 'Updated printer ink bundle', 'Standard package', 8.00, 3000.00, 0, '2026-02-25 16:28:26', '2026-02-25 17:00:04'),
(2, 1, '2', 'STK-7713', 'set', 'Generated item 2 for PR-2026-000001', 'Standard package', 37.00, 42239.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(3, 2, '1', 'STK-5497', 'box', 'Generated item 1 for PR-2026-000002', 'Standard package', 38.00, 14881.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(4, 2, '2', 'STK-7124', 'set', 'Generated item 2 for PR-2026-000002', 'Standard package', 24.00, 42661.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(5, 2, '3', 'STK-4702', 'set', 'Generated item 3 for PR-2026-000002', 'Standard package', 11.00, 49321.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(6, 3, '1', 'STK-8956', 'box', 'Generated item 1 for PR-2026-000003', 'Standard package', 26.00, 44165.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(7, 3, '2', 'STK-9785', 'pcs', 'Generated item 2 for PR-2026-000003', 'Standard package', 46.00, 24585.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(8, 3, '3', 'STK-5242', 'pcs', 'Generated item 3 for PR-2026-000003', 'Standard package', 40.00, 21685.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(9, 4, '1', 'STK-8147', 'set', 'Generated item 1 for PR-2026-000004', 'Standard package', 5.00, 24513.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(10, 4, '2', 'STK-7028', 'pcs', 'Generated item 2 for PR-2026-000004', 'Standard package', 16.00, 25668.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(11, 4, '3', 'STK-1233', 'pcs', 'Generated item 3 for PR-2026-000004', 'Standard package', 23.00, 17379.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(12, 5, '1', 'STK-1914', 'box', 'Generated item 1 for PR-2026-000005', 'Standard package', 32.00, 37171.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(13, 6, '1', 'STK-8083', 'set', 'Generated item 1 for PR-2026-000006', 'Standard package', 5.00, 49510.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(14, 6, '2', 'STK-1775', 'pcs', 'Generated item 2 for PR-2026-000006', 'Standard package', 20.00, 15845.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(15, 7, '1', 'STK-9890', 'set', 'Generated item 1 for PR-2026-000007', 'Standard package', 26.00, 2199.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(16, 7, '2', 'STK-7668', 'pcs', 'Generated item 2 for PR-2026-000007', 'Standard package', 10.00, 22961.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(17, 7, '3', 'STK-3959', 'set', 'Generated item 3 for PR-2026-000007', 'Standard package', 46.00, 42501.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(18, 8, '1', 'STK-8451', 'box', 'Generated item 1 for PR-2026-000008', 'Standard package', 15.00, 17157.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(19, 9, '1', 'STK-2327', 'box', 'Generated item 1 for PR-2026-000009', 'Standard package', 28.00, 41168.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(20, 9, '2', 'STK-6242', 'set', 'Generated item 2 for PR-2026-000009', 'Standard package', 23.00, 10016.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(21, 9, '3', 'STK-5012', 'set', 'Generated item 3 for PR-2026-000009', 'Standard package', 3.00, 2229.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(22, 10, '1', 'STK-8584', 'pcs', 'Generated item 1 for PR-2026-000010', 'Standard package', 20.00, 25467.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(23, 10, '2', 'STK-8907', 'set', 'Generated item 2 for PR-2026-000010', 'Standard package', 28.00, 10849.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(24, 10, '3', 'STK-2596', 'box', 'Generated item 3 for PR-2026-000010', 'Standard package', 50.00, 4570.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(25, 11, '1', 'STK-9700', 'box', 'Generated item 1 for PR-2026-000011', 'Standard package', 7.00, 23635.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(26, 11, '2', 'STK-1543', 'pcs', 'Generated item 2 for PR-2026-000011', 'Standard package', 3.00, 2344.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(27, 12, '1', 'STK-8222', 'box', 'Generated item 1 for PR-2026-000012', 'Standard package', 42.00, 13559.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(28, 12, '2', 'STK-4906', 'box', 'Generated item 2 for PR-2026-000012', 'Standard package', 49.00, 6721.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(29, 12, '3', 'STK-2593', 'pcs', 'Generated item 3 for PR-2026-000012', 'Standard package', 37.00, 43773.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(30, 12, '4', 'STK-3320', 'pcs', 'Generated item 4 for PR-2026-000012', 'Standard package', 22.00, 38141.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(31, 13, '1', 'STK-6762', 'pcs', 'Generated item 1 for PR-2026-000013', 'Standard package', 13.00, 47960.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(32, 13, '2', 'STK-3643', 'box', 'Generated item 2 for PR-2026-000013', 'Standard package', 48.00, 14405.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(33, 14, '1', 'STK-3658', 'pcs', 'Generated item 1 for PR-2026-000014', 'Standard package', 12.00, 17696.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(34, 14, '2', 'STK-1279', 'box', 'Generated item 2 for PR-2026-000014', 'Standard package', 31.00, 36305.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(35, 14, '3', 'STK-9300', 'box', 'Generated item 3 for PR-2026-000014', 'Standard package', 25.00, 39920.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(36, 15, '1', 'STK-5281', 'box', 'Generated item 1 for PR-2026-000015', 'Standard package', 25.00, 47493.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(37, 15, '2', 'STK-7638', 'pcs', 'Generated item 2 for PR-2026-000015', 'Standard package', 44.00, 14235.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(38, 16, '1', 'STK-2667', 'box', 'Generated item 1 for PR-2026-000016', 'Standard package', 7.00, 12752.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(39, 17, '1', 'STK-3273', 'set', 'Generated item 1 for PR-2026-000017', 'Standard package', 21.00, 34750.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(40, 17, '2', 'STK-4627', 'box', 'Generated item 2 for PR-2026-000017', 'Standard package', 38.00, 41200.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(41, 17, '3', 'STK-6357', 'pcs', 'Generated item 3 for PR-2026-000017', 'Standard package', 45.00, 28740.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(42, 18, '1', 'STK-4065', 'pcs', 'Generated item 1 for PR-2026-000018', 'Standard package', 43.00, 48973.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(43, 18, '2', 'STK-8319', 'set', 'Generated item 2 for PR-2026-000018', 'Standard package', 26.00, 10102.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(44, 19, '1', 'STK-2269', 'set', 'Generated item 1 for PR-2026-000019', 'Standard package', 21.00, 45453.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(45, 19, '2', 'STK-4514', 'set', 'Generated item 2 for PR-2026-000019', 'Standard package', 37.00, 13082.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(46, 19, '3', 'STK-6679', 'box', 'Generated item 3 for PR-2026-000019', 'Standard package', 21.00, 8559.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(47, 20, '1', 'STK-7602', 'set', 'Generated item 1 for PR-2026-000020', 'Standard package', 4.00, 39518.00, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(48, 21, '1', 'STK-1001', 'pcs', 'Ergonomic office chair', 'Lumbar support, wheels', 10.00, 5500.75, 0, '2026-02-25 16:49:32', '2026-02-25 16:49:32'),
(49, 1, '2', 'STK-2002', 'box', 'Printer Ink', 'Black + Color', 5.00, 3200.00, 0, '2026-02-25 16:59:41', '2026-02-25 16:59:41');

-- --------------------------------------------------------

--
-- Table structure for table `login_otps`
--

CREATE TABLE `login_otps` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `email` varchar(255) NOT NULL,
  `otp_hash` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `attempts` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `consumed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `login_otps`
--

INSERT INTO `login_otps` (`id`, `email`, `otp_hash`, `expires_at`, `attempts`, `consumed_at`, `created_at`, `updated_at`) VALUES
(1, 'grantarachea@gmail.com', '$2y$12$TaZrzFOuVbjPe8p6FPeqSupkxmksOjrrI9MHfpHkBuoxPoeHsfRKS', '2026-02-24 21:15:30', 0, '2026-02-24 21:11:42', '2026-02-24 21:10:30', '2026-02-24 21:11:42'),
(2, 'grantarachea@gmail.com', '$2y$12$lKhIApuu/M0UKdS9F2g9H.IRVvZGCgpbMKTBX9jeB4QCrACpcOHMS', '2026-02-24 21:36:10', 1, '2026-02-24 21:32:27', '2026-02-24 21:31:10', '2026-02-24 21:32:27'),
(3, 'grantarachea@gmail.com', '$2y$12$/XqFfgRjTe1TcBjCrcKpveaXyuLnz/aMKSF3TUjod/BDd6n4i0HlW', '2026-02-24 22:13:50', 0, '2026-02-24 22:09:29', '2026-02-24 22:08:50', '2026-02-24 22:09:29'),
(4, 'grantarachea09@gmail.com', '$2y$12$7agMu1ohgD9wgq7zInsm6.Vg.uLwO8qIjDHmR1I1VHuiHRvgexzli', '2026-02-24 22:32:43', 0, '2026-02-24 22:28:39', '2026-02-24 22:27:43', '2026-02-24 22:28:39'),
(5, 'grantarachea09@gmail.com', '$2y$12$mWRYXFAhZ9Jt7/U95ZICdOC.VSVbbRLOoLoge/J850hB9vwuOGDgu', '2026-02-24 22:46:15', 3, '2026-02-24 22:53:51', '2026-02-24 22:41:15', '2026-02-24 22:53:51'),
(6, 'grantarachea@gmail.com', '$2y$12$ZC1OlgivhFpFHyk6TfU0YuSrmXFwpIfT5d8VJKsmYGVboLNjS/Ahy', '2026-02-24 22:48:17', 0, '2026-02-24 22:43:52', '2026-02-24 22:43:17', '2026-02-24 22:43:52'),
(7, 'grantarachea09@gmail.com', '$2y$12$22IV/WYpNovEG239hivP1O/f4rkGDBwRM3X8UP9Y6A7Fn9PNN/Rwy', '2026-02-24 22:58:52', 0, '2026-02-24 22:54:41', '2026-02-24 22:53:52', '2026-02-24 22:54:41'),
(8, 'grantarachea@gmail.com', '$2y$12$WXv15rSsPe81FBi2315IX.yY8u9Nfr9FJZ8GYw1NnXlvrDcnKU5Ee', '2026-02-25 16:14:09', 0, '2026-02-25 16:10:17', '2026-02-25 16:09:09', '2026-02-25 16:10:17'),
(9, 'grantarachea@gmail.com', '$2y$12$K0OvBA2I2v57rv6Cx1rFNOoxwVd5qinnbOJdvka6xZMbYScrwx4pW', '2026-02-25 16:50:48', 0, '2026-02-25 16:46:42', '2026-02-25 16:45:48', '2026-02-25 16:46:42'),
(10, 'emmanllamas052@gmail.com', '$2y$12$hPzntCGCHMGGe6a/nbvOPO.gHdTjROjb1Dg0Jaet6rCt1MZ03mTfO', '2026-02-26 05:01:42', 0, '2026-02-25 21:01:42', '2026-02-25 21:01:17', '2026-02-25 21:01:42'),
(11, 'emmanllamas052@gmail.com', '$2y$12$DdURkI4b2EThtnXzOz8kgum5Od6ZvXewPWe4qMOQ.KI5baiwt4ALq', '2026-02-26 06:39:28', 0, '2026-02-25 22:39:28', '2026-02-25 22:37:06', '2026-02-25 22:39:28'),
(12, 'emmanllamas052@gmail.com', '$2y$12$DOOr.BWxxC3fnHQ8eXmNOeXRqqGmTVyOIItmN1zSsZ377fm1shYk.', '2026-02-26 06:39:52', 0, '2026-02-25 22:39:52', '2026-02-25 22:39:28', '2026-02-25 22:39:52');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '2026_02_23_051036_login_otps_table', 1),
(3, '2026_02_25_000311_create_roles_table', 1),
(4, '2026_02_25_010510_create_notifications_table', 1),
(5, '2026_02_25_013709_create_procurements_table', 1),
(6, '2026_02_25_014143_create_procurement_pdfs_table', 1),
(7, '2026_02_26_120000_create_purchase_requests_table', 2),
(8, '2026_02_26_120100_create_items_table', 2),
(9, '2026_02_26_130000_add_deleted_flags_to_purchase_requests_and_items', 3);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `type` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `read_at`, `created_at`, `updated_at`) VALUES
(1, 2, 'procurement_submitted', 'New Procurement Submitted', 'GRANT ARACHEA submitted procurement PR-2026-000003 for review.', '{\"status\": \"pending\", \"requested_by\": 1, \"procurement_id\": 3, \"procurement_no\": \"PR-2026-000003\"}', NULL, '2026-02-24 22:14:42', '2026-02-24 22:14:42'),
(2, 1, 'procurement_accepted', 'Procurement Status Updated', 'Your procurement PR-2026-000001 changed from pending to accepted.', '{\"new_status\": \"accepted\", \"old_status\": \"pending\", \"procurement_id\": 1, \"procurement_no\": \"PR-2026-000001\"}', NULL, '2026-02-24 22:29:12', '2026-02-24 22:29:12'),
(3, 1, 'procurement_rejected', 'Procurement Status Updated', 'Your procurement PR-2026-000002 changed from pending to rejected.', '{\"new_status\": \"rejected\", \"old_status\": \"pending\", \"procurement_id\": 2, \"procurement_no\": \"PR-2026-000002\"}', NULL, '2026-02-24 22:29:24', '2026-02-24 22:29:24'),
(4, 2, 'procurement_submitted', 'New Procurement Submitted', 'GRANT ARACHEA submitted procurement PR-2026-000021 for review.', '{\"status\": \"pending\", \"requested_by\": 1, \"procurement_id\": 21, \"procurement_no\": \"PR-2026-000021\"}', NULL, '2026-02-25 16:49:32', '2026-02-25 16:49:32');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `procurements`
--

CREATE TABLE `procurements` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `procurement_no` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `mode_of_procurement` varchar(255) NOT NULL,
  `project` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `description` text DEFAULT NULL,
  `requested_by` bigint(20) UNSIGNED NOT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `procurements`
--

INSERT INTO `procurements` (`id`, `procurement_no`, `title`, `mode_of_procurement`, `project`, `status`, `description`, `requested_by`, `deleted`, `created_at`, `updated_at`) VALUES
(1, 'PR-2026-000001', 'Office Chairs', 'Shopping', 'Facilities Upgrade', 'accepted', 'Need 20 ergonomic chairs', 1, 0, '2026-02-24 21:12:46', '2026-02-24 22:29:12'),
(2, 'PR-2026-000002', 'Office Chairs Retest', 'Shopping', 'Facilities Upgrade', 'rejected', 'Retest procurement creation', 1, 0, '2026-02-24 21:40:36', '2026-02-24 22:29:24'),
(3, 'PR-2026-000003', 'Test Notification PR', 'Shopping', 'Notification Test', 'pending', 'testing', 1, 0, '2026-02-24 22:14:42', '2026-02-24 22:14:42'),
(4, 'PR-2026-000004', 'Office Supply Batch #4', 'Direct Contracting', 'IT Infrastructure', 'ongoing', 'Generated sample procurement record #4', 1, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(5, 'PR-2026-000005', 'Office Supply Batch #5', 'Shopping', 'Office Upgrade', 'approved', 'Generated sample procurement record #5', 1, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(6, 'PR-2026-000006', 'Office Supply Batch #6', 'Shopping', 'Office Upgrade', 'approved', 'Generated sample procurement record #6', 1, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(7, 'PR-2026-000007', 'Office Supply Batch #7', 'Direct Contracting', 'Office Upgrade', 'approved', 'Generated sample procurement record #7', 1, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(8, 'PR-2026-000008', 'Office Supply Batch #8', 'Direct Contracting', 'IT Infrastructure', 'ongoing', 'Generated sample procurement record #8', 1, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(9, 'PR-2026-000009', 'Office Supply Batch #9', 'Shopping', 'Facilities Maintenance', 'approved', 'Generated sample procurement record #9', 1, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(10, 'PR-2026-000010', 'Office Supply Batch #10', 'Shopping', 'IT Infrastructure', 'pending', 'Generated sample procurement record #10', 1, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(11, 'PR-2026-000011', 'Office Supply Batch #11', 'Bidding', 'Office Upgrade', 'approved', 'Generated sample procurement record #11', 1, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(12, 'PR-2026-000012', 'Office Supply Batch #12', 'Shopping', 'IT Infrastructure', 'pending', 'Generated sample procurement record #12', 1, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(13, 'PR-2026-000013', 'Office Supply Batch #13', 'Shopping', 'IT Infrastructure', 'pending', 'Generated sample procurement record #13', 1, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(14, 'PR-2026-000014', 'Office Supply Batch #14', 'Bidding', 'Facilities Maintenance', 'pending', 'Generated sample procurement record #14', 1, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(15, 'PR-2026-000015', 'Office Supply Batch #15', 'Shopping', 'Office Upgrade', 'approved', 'Generated sample procurement record #15', 1, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(16, 'PR-2026-000016', 'Office Supply Batch #16', 'Direct Contracting', 'Facilities Maintenance', 'approved', 'Generated sample procurement record #16', 1, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(17, 'PR-2026-000017', 'Office Supply Batch #17', 'Direct Contracting', 'Facilities Maintenance', 'pending', 'Generated sample procurement record #17', 1, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(18, 'PR-2026-000018', 'Office Supply Batch #18', 'Direct Contracting', 'Facilities Maintenance', 'ongoing', 'Generated sample procurement record #18', 1, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(19, 'PR-2026-000019', 'Office Supply Batch #19', 'Bidding', 'Office Upgrade', 'pending', 'Generated sample procurement record #19', 1, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(20, 'PR-2026-000020', 'Office Supply Batch #20', 'Shopping', 'Facilities Maintenance', 'pending', 'Generated sample procurement record #20', 1, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(21, 'PR-2026-000021', 'Updated Procurement Title', 'Shopping', 'Updated Project', 'pending', 'Updated notes', 1, 0, '2026-02-25 16:49:32', '2026-02-25 16:50:17');

-- --------------------------------------------------------

--
-- Table structure for table `procurement_pdfs`
--

CREATE TABLE `procurement_pdfs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `procurement_id` bigint(20) UNSIGNED NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `checklist` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`checklist`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `procurement_pdfs`
--

INSERT INTO `procurement_pdfs` (`id`, `procurement_id`, `file_name`, `file_path`, `checklist`, `created_at`, `updated_at`) VALUES
(1, 1, 'request-form.pdf', 'procurements/1/oswuVSrEcjqWe8gzUU0MmZoEIk1blG6QXYFekOQf.pdf', '{\"signed\": \"true\", \"quotation_attached\": \"false\"}', '2026-02-24 21:45:51', '2026-02-24 21:45:51'),
(2, 21, 'hahah.pdf', 'procurements/21/EQpNtfGd40kyYbG27gTgKBIzo7HlQvBnLmh6ak6e.pdf', '{\"signed\": true, \"remarks\": \"initial upload\", \"complete\": true}', '2026-02-25 16:52:19', '2026-02-25 16:52:19');

-- --------------------------------------------------------

--
-- Table structure for table `purchase_requests`
--

CREATE TABLE `purchase_requests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `procurement_id` bigint(20) UNSIGNED NOT NULL,
  `purchase_request_number` varchar(255) NOT NULL,
  `office` varchar(255) NOT NULL,
  `date_created` date NOT NULL,
  `responsibility_center_code` varchar(100) NOT NULL,
  `purpose` text NOT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchase_requests`
--

INSERT INTO `purchase_requests` (`id`, `procurement_id`, `purchase_request_number`, `office`, `date_created`, `responsibility_center_code`, `purpose`, `deleted`, `created_at`, `updated_at`) VALUES
(1, 1, 'PUR-2026-000001', 'Engineering Office', '2026-02-27', 'RCC-009', 'Updated purchase request purpose', 0, '2026-02-25 16:28:26', '2026-02-25 16:58:44'),
(2, 2, 'PUR-2026-000002', 'Engineering Office', '2026-02-08', 'RCC-112', 'Generated purchase request for Facilities Upgrade', 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(3, 3, 'PUR-2026-000003', 'Admin Office', '2026-02-13', 'RCC-152', 'Generated purchase request for Notification Test', 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(4, 4, 'PUR-2026-000004', 'ICT Office', '2026-02-18', 'RCC-651', 'Generated purchase request for IT Infrastructure', 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(5, 5, 'PUR-2026-000005', 'ICT Office', '2026-02-19', 'RCC-926', 'Generated purchase request for Office Upgrade', 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(6, 6, 'PUR-2026-000006', 'Engineering Office', '2026-02-10', 'RCC-229', 'Generated purchase request for Office Upgrade', 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(7, 7, 'PUR-2026-000007', 'Admin Office', '2026-02-03', 'RCC-409', 'Generated purchase request for Office Upgrade', 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(8, 8, 'PUR-2026-000008', 'Budget Office', '2026-02-23', 'RCC-271', 'Generated purchase request for IT Infrastructure', 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(9, 9, 'PUR-2026-000009', 'General Services', '2026-02-23', 'RCC-813', 'Generated purchase request for Facilities Maintenance', 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(10, 10, 'PUR-2026-000010', 'Budget Office', '2026-01-31', 'RCC-076', 'Generated purchase request for IT Infrastructure', 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(11, 11, 'PUR-2026-000011', 'General Services', '2026-02-25', 'RCC-405', 'Generated purchase request for Office Upgrade', 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(12, 12, 'PUR-2026-000012', 'Engineering Office', '2026-02-18', 'RCC-387', 'Generated purchase request for IT Infrastructure', 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(13, 13, 'PUR-2026-000013', 'General Services', '2026-02-11', 'RCC-608', 'Generated purchase request for IT Infrastructure', 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(14, 14, 'PUR-2026-000014', 'Engineering Office', '2026-02-24', 'RCC-865', 'Generated purchase request for Facilities Maintenance', 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(15, 15, 'PUR-2026-000015', 'ICT Office', '2026-01-29', 'RCC-162', 'Generated purchase request for Office Upgrade', 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(16, 16, 'PUR-2026-000016', 'Admin Office', '2026-02-26', 'RCC-596', 'Generated purchase request for Facilities Maintenance', 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(17, 17, 'PUR-2026-000017', 'Admin Office', '2026-02-05', 'RCC-863', 'Generated purchase request for Facilities Maintenance', 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(18, 18, 'PUR-2026-000018', 'ICT Office', '2026-02-25', 'RCC-555', 'Generated purchase request for Facilities Maintenance', 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(19, 19, 'PUR-2026-000019', 'Admin Office', '2026-02-05', 'RCC-416', 'Generated purchase request for Office Upgrade', 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(20, 20, 'PUR-2026-000020', 'Budget Office', '2026-02-16', 'RCC-374', 'Generated purchase request for Facilities Maintenance', 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(21, 21, 'PUR-2026-000021', 'Admin Office', '2026-02-26', 'RCC-001', 'Office seating replacement', 0, '2026-02-25 16:49:32', '2026-02-25 16:49:32');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `role_type` varchar(255) NOT NULL,
  `designation` varchar(255) DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL,
  `role` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `role_type`, `designation`, `position`, `role`, `created_at`, `updated_at`) VALUES
(1, 'focal', 'chairperson', 'ojt', 'user', '2026-02-24 21:09:10', '2026-02-24 21:09:10'),
(2, 'adq', 'chair', 'ojt', 'Budget Officer', '2026-02-24 21:09:10', '2026-02-24 21:09:10');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('6qCjhZpCIVB9W2NW1NdFitM2jw75mZ34zKNwmcWS', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiVUNTbDFmQncweGJXU0FQSVlyOFZyQk9TSFhBUzVGSXZBTHFQMmczcyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1772087544),
('7u03ktFrdxiSya5p3qLZYGNPdnxDibeGTfbtzAxc', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiRE5DWTZxWktwS2ZpZVpLcUNJaXh3UFM3ZjhaWTlrZVNncWsxZkJRdCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9wcm9jdXJlbWVudHMiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1772088035),
('Bs84tDNy9cnJNWwyNqJZkNygzcvdvaXqyLsRL3ZW', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiT091elpEVzRFQXBTVDFBQ0pQUWRJV2Vvem5vZk50bEdMYlhwVzJmeSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1772087582),
('FSxk7p8Q7HPr6l1DMG3bimrQuJPOoyTwagtenv24', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiMllHM2JCVU9KZmcyQ2YyN01BN2JvbWNLVHg1SDdwczl1WXJYdlFLOSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1772087606),
('FzJ8b9MiCA07utsxYj45LwMANGjOOqN8tAQzVHem', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiVk9NUzhCQ2tudmNyOTFvd1FNMWVmRXEwZVB5dFZMNGE4TXcxeWlLSiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1772087713),
('GIkVU69iFqwZj66GmBwkyGmiIDtbs5gpJo765iKd', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoic3Nzd1FSM2J3V29oZ1ZlS3VpMXJwdldwZVU5d3kydjdEQ0NrdkxXTyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1772087589),
('GiSCcoLa7mE1pfOxsJEpZNOUV17j60PTDLN7cmfD', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZjdQYTgxcXpDdWRxVUtnZkRwV3BRRWhyYjYyTHcwVWFWOWlWZVBEMSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1772087211),
('HcgXIOlAEE6JS2xVU7to5DfW7F94Ryzv6TSGalf0', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiRlFvcjFPUDVlUHZ2UXRTUnEwRmdpY3BUbzVQZFpvMnhSVnJidUxNaiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1772087242),
('HGq4MWOgxpf0xTyUc64yTGbeT9LOK1ZCsQAWtAi1', 3, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoicjR0ZGdDdmRBbDNxMXZBbnk0S2RDeWhLVEE2VTNTVEJuNXZMMldqRyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MztzOjk6Il9wcmV2aW91cyI7YToyOntzOjM6InVybCI7czozNDoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL3Byb2N1cmVtZW50cyI7czo1OiJyb3V0ZSI7Tjt9fQ==', 1772088049),
('iDRucEk0V4U6tcYLnNMB6z7a8VFCCiMOS6mcy6Dp', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoib3pKWHczcUl4QVFlUDJOQmxjS0NUamg0VWFxRFI4Y3RrZTEyMHBJSiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1772087225),
('ivmoPzzGxSMhKWxfhAqxPmABdhPLBd0TLsKqJyeR', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiRXRFVVBUQTJvdWhyaVJ2OEdlcGQ3QkVIT1RDUGdlT2VZZlBDbHdWWiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1772087213),
('PjczXjqNKIDIWZQBGcujlU50nzgYrUVnXMgp6dpA', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/2.5.25 Chrome/142.0.7444.265 Electron/39.4.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiem1tRjhnT0YzcVFVQXZyZGpOVExtNHNFQkx3YXFMVHJMV05IcDRnUCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1772087832),
('qfqkh2qd9sBaVGcINgheozMZwpyjpuS9InwIEFjS', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiem1mdTlFaFRGakl0TjN4RzVIWmpGUHExbVJEdkFsSkFoMXlGOGx1dSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1772087277),
('QYIs4oRycmcJhaEZ3YgucIUya3JSZTzSYLmXYHkK', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiN2JDdUQ5ZHMxNXpQck5aRmxPS3lRSkZnaXlFMmswU2tmeUZleDQzciI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1772087248),
('RQBhipMecDuxqGNCF5KYxWRmU2QlklMWoCko53n6', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiWGhqOWh6Q3RlUDV4MTFhM2tLdEpHUnh4Slh1ZU5zWFFjdkxTMGV4TCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1772087221),
('uanvgrczzMFuF4WYd9uyOkOzDaJjppAUj2RjxOwl', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiN2xjTDhqQlhMY0loUlhmQ1lRMkVHbG84RFZjT0o0cjZlRW45TFVLaSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1772087948),
('UkSbS1o97lkNDvo7dVwhwW96FTs8k4vgOkLGTQNV', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoidFdjVERIMnY1THJuMFlFWDZzTUJnS3NMb0k4UXJ5MG11M2VjMjRGMyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1772087224),
('URYAfxFezml6hp0lOpDwBTT4NGpQhjYEqwr54cfT', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoibWh3ZzZsUUUwdEgyOTdGMHdHYkZXY3RodUxxa3ZDWUtvTGFPY1g3eCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9wcm9jdXJlbWVudHMiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1772088029),
('V8C2O3KOqMKbvvwOlSgTdi9aQzZyVfh6kiIBUrXs', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiaWQ2YVYwbUFsbkNXTkVuYlNyT3JUU3k4NjlUdDlpVDFzYks4cXNUUSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1772087222),
('xjHgDtpVbmbktoAB4SZYSgz7nIQlE47sxMEfF1Gx', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiQlVWTXJLNzNBY0g0enVtT0ZLbnBxNHQwazBIbnhnUmhrc2hPVFdZWSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1772087227),
('XNMbviE4grzfhd17F3U9EOzEDhQds6RTLpWmX1q7', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiemVacG51RUExdXJnMGVxVzNtRXpGa2ZCN3V0TFo1RktNQk40dUZQbiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1772087725),
('XPDDJjEsAa0m6kvTrxOU3Ny63P1DhPNtrZxu9iXL', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiTGtCbnQxc29vTTFiT0JIOHJkVnVIWXBVa2F6Sjh4bE1aaTFBWU5ITCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1772087208),
('yNyD7rwvV0n2Llg1sLwbfoSsPOogK7JPvssqzDDB', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiMFV5ZmFzalFrVG41ZFhKbGppa3VWNTJFQ3BpYng0NjBNVHpYRGVhOCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1772087343),
('ZEg7Ov4TT26Y0hBQ5jQLJ31wiZVUS5nJSjzlby02', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiclI1SzlUak0xYU03U0Fna2VjOVpDZ2dxSVBpMWNrTjdvNnpzalFsTCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1772087551),
('zWTYfJNqkdt4wTi7s0YWT7DpaYRd1kKCzKkBf1SR', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoid3R1d3BLdTN0eTJETkJTZFhPbm81WmhPR3d5VmJ0VlpGWmhyNHFuNiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1772087245);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `middle_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `access_type` varchar(255) NOT NULL,
  `role_id` bigint(20) UNSIGNED DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_authorized` tinyint(1) NOT NULL DEFAULT 1,
  `active_session_id` varchar(255) DEFAULT NULL,
  `active_device_fingerprint` varchar(64) DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `last_name`, `first_name`, `middle_name`, `email`, `username`, `access_type`, `role_id`, `is_active`, `is_authorized`, `active_session_id`, `active_device_fingerprint`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'ARACHEA', 'GRANT', 'liwanag', 'grantarachea@gmail.com', 'hey', 'user', 1, 1, 1, 'gYp4DghxuBCzlwR4QJlkLeUdnc3OLqz0ZKX6ulQc', 'c0dea510547aa0374f156589f64c513b66b9c095b96ad11ef6794dcf088ce889', NULL, '2026-02-24 21:09:10', '2026-02-25 16:46:43'),
(2, 'OfficerTwo', 'Budget', NULL, 'grantarachea09@gmail.com', 'budget.officer2', 'budget_officer', 2, 1, 1, 'nvnbaN4tHhSJVGlCi9OJkPOUKmP4tvsXyJPEiR3X', 'c0dea510547aa0374f156589f64c513b66b9c095b96ad11ef6794dcf088ce889', NULL, '2026-02-24 22:02:55', '2026-02-24 22:54:41'),
(3, 'Llamas', 'Emman', 'Hahaness', 'emmanllamas052@gmail.com', 'emman111222333', 'user', NULL, 1, 1, 'HGq4MWOgxpf0xTyUc64yTGbeT9LOK1ZCsQAWtAi1', '09e4c337132f51c0016bc0e649662186950fd28f27ef775baa9136fd02f2ae92', NULL, NULL, '2026-02-25 22:39:54');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `items_purchase_request_id_foreign` (`purchase_request_id`);

--
-- Indexes for table `login_otps`
--
ALTER TABLE `login_otps`
  ADD PRIMARY KEY (`id`),
  ADD KEY `login_otps_email_index` (`email`),
  ADD KEY `login_otps_expires_at_index` (`expires_at`),
  ADD KEY `login_otps_consumed_at_index` (`consumed_at`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_user_id_foreign` (`user_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `procurements`
--
ALTER TABLE `procurements`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `procurements_procurement_no_unique` (`procurement_no`),
  ADD KEY `procurements_requested_by_foreign` (`requested_by`);

--
-- Indexes for table `procurement_pdfs`
--
ALTER TABLE `procurement_pdfs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `procurement_pdfs_procurement_id_foreign` (`procurement_id`);

--
-- Indexes for table `purchase_requests`
--
ALTER TABLE `purchase_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `purchase_requests_procurement_id_unique` (`procurement_id`),
  ADD UNIQUE KEY `purchase_requests_purchase_request_number_unique` (`purchase_request_number`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `users_username_unique` (`username`),
  ADD KEY `users_role_id_index` (`role_id`),
  ADD KEY `users_active_session_id_index` (`active_session_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `login_otps`
--
ALTER TABLE `login_otps`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `procurements`
--
ALTER TABLE `procurements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `procurement_pdfs`
--
ALTER TABLE `procurement_pdfs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `purchase_requests`
--
ALTER TABLE `purchase_requests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `items`
--
ALTER TABLE `items`
  ADD CONSTRAINT `items_purchase_request_id_foreign` FOREIGN KEY (`purchase_request_id`) REFERENCES `purchase_requests` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `procurements`
--
ALTER TABLE `procurements`
  ADD CONSTRAINT `procurements_requested_by_foreign` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `procurement_pdfs`
--
ALTER TABLE `procurement_pdfs`
  ADD CONSTRAINT `procurement_pdfs_procurement_id_foreign` FOREIGN KEY (`procurement_id`) REFERENCES `procurements` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `purchase_requests`
--
ALTER TABLE `purchase_requests`
  ADD CONSTRAINT `purchase_requests_procurement_id_foreign` FOREIGN KEY (`procurement_id`) REFERENCES `procurements` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
