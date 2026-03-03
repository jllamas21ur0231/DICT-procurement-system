-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 03, 2026 at 08:56 AM
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
(49, 1, '2', 'STK-2002', 'box', 'Printer Ink', 'Black + Color', 5.00, 3200.00, 0, '2026-02-25 16:59:41', '2026-02-25 16:59:41'),
(50, 22, '1', 'STK-1001', 'pcs', 'Test item', 'Sample inclusion', 2.00, 1000.00, 0, '2026-03-01 22:42:40', '2026-03-01 22:42:40');

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
(10, 'grantarachea@gmail.com', '$2y$12$p8AAe6dyd8Qz0cJmvjfen.CfOwkm7Fgp5U5xrYklV1UjatvkQIR16', '2026-03-01 18:41:27', 0, '2026-03-01 18:36:51', '2026-03-01 18:36:27', '2026-03-01 18:36:51'),
(11, 'grantarachea@gmail.com', '$2y$12$gB/giGjERrw7XVWkDwtFL..n.bhXNdCzpdIKPh3gJsCWhNjMPv0Vm', '2026-03-01 22:24:40', 0, '2026-03-01 22:20:16', '2026-03-01 22:19:40', '2026-03-01 22:20:16'),
(12, 'grantarachea@gmail.com', '$2y$12$vUTPT3WkjetyPfoVUDZ1MuSlmiUW8CdV9hb0AuGCRvULDObKRMOrW', '2026-03-01 22:25:16', 0, '2026-03-01 22:20:44', '2026-03-01 22:20:16', '2026-03-01 22:20:44'),
(13, 'emmanllamas052@gmail.com', '$2y$12$i4quyOe0r4.0lT7Ju3mwluMlIpFbO4AmZHjnevsmWHGuFTreiptE6', '2026-03-02 07:31:45', 0, '2026-03-01 23:31:45', '2026-03-01 23:31:30', '2026-03-01 23:31:45'),
(14, 'emmanllamas052@gmail.com', '$2y$12$sb6cdeiK00r1UPgLPnE.0.bPTvsWCG8Xzen3BfnMMVF3alev51Jsy', '2026-03-02 07:41:23', 0, '2026-03-01 23:41:23', '2026-03-01 23:41:07', '2026-03-01 23:41:23'),
(15, 'emmanllamas052@gmail.com', '$2y$12$zJwNN/x5NDvhdAHDNgtKauoGdqGaRo.qiKjUD58M1E9dCkb746pKS', '2026-03-02 07:45:02', 0, '2026-03-01 23:45:02', '2026-03-01 23:44:47', '2026-03-01 23:45:02'),
(16, 'emmanlabwork@gmail.com', '$2y$12$NN3c31dFP4exktYoyGsvL.5G2VUv//8tPmjsiKvDfJUwbO2/Nser6', '2026-03-03 02:12:55', 0, '2026-03-02 18:12:55', '2026-03-02 18:12:32', '2026-03-02 18:12:55'),
(17, 'emmanlabwork@gmail.com', '$2y$12$Q.Cn01sd5OZTjUcVeUT2eeQCqjB5xK8q0WlFZQQw84iknbPSZa5/C', '2026-03-03 02:17:23', 0, '2026-03-02 18:17:23', '2026-03-02 18:16:46', '2026-03-02 18:17:23'),
(18, 'emmanllamas052@gmail.com', '$2y$12$Dm4qFQlpip26YH8wQOABY.PqcHtMorA/FSKkgKKaFXWoQJa2eSwFm', '2026-03-03 02:20:41', 0, '2026-03-02 18:20:41', '2026-03-02 18:20:28', '2026-03-02 18:20:41'),
(19, 'emmanlabwork@gmail.com', '$2y$12$Iu6wyVpdwWVNxonp1wj6zOQueGx2P..9zXjVlG0VO6pGp5B499Nhi', '2026-03-03 02:39:38', 0, '2026-03-02 18:39:38', '2026-03-02 18:38:34', '2026-03-02 18:39:38'),
(20, 'emmanllamas052@gmail.com', '$2y$12$iCahOAy1soiyhuBFMyxmz.gLH7aPGmWkCFGuR8AgxwQsWR9/GnnqG', '2026-03-03 02:41:48', 0, '2026-03-02 18:41:48', '2026-03-02 18:40:45', '2026-03-02 18:41:48'),
(21, 'emmanllamas052@gmail.com', '$2y$12$E16z7mueyU9jUXKG06tKGe4CKnev4ClNC.zRlxcUJbpOTdmAkVi8W', '2026-03-03 02:49:57', 1, '2026-03-02 18:49:57', '2026-03-02 18:49:29', '2026-03-02 18:49:57'),
(22, 'emmanlabwork@gmail.com', '$2y$12$0biwdydlRsTOtbJx9cLOcOg2J/q3zQ6Ry5HsMAabC5ZAnvsSDvEei', '2026-03-03 03:42:12', 0, '2026-03-02 19:42:12', '2026-03-02 19:41:37', '2026-03-02 19:42:12'),
(23, 'emmanlabwork@gmail.com', '$2y$12$jLZwnKzV9WttOMq1USce4u7rmODMxly6NYjmloeMzW5SUwLNnExOi', '2026-03-03 03:43:30', 0, '2026-03-02 19:43:30', '2026-03-02 19:43:04', '2026-03-02 19:43:30'),
(24, 'emmanlabwork@gmail.com', '$2y$12$HfVuWJNLa3XAE3wwaF3tA.Lig11Bi9NjDO/umMv7MCMLOQigoa5Ve', '2026-03-03 03:45:13', 0, '2026-03-02 19:45:13', '2026-03-02 19:44:37', '2026-03-02 19:45:13'),
(25, 'emmanllamas052@gmail.com', '$2y$12$1.0mUvEC8t3gDZo1ZkZXr.V44NzrIJeEnDQGL5scpj5A2ThDcOLf2', '2026-03-03 03:46:05', 0, '2026-03-02 19:46:05', '2026-03-02 19:44:48', '2026-03-02 19:46:05'),
(26, 'emmanllamas052@gmail.com', '$2y$12$y/kPK5LYB4zJ0XrcI.Fgkune.NStMU.wGDF8sDS.mM9NN8GcPIY7C', '2026-03-03 05:16:22', 0, '2026-03-02 21:16:22', '2026-03-02 21:15:33', '2026-03-02 21:16:22'),
(27, 'emmanllamas052@gmail.com', '$2y$12$2.U9LIVnDAhfXg0IhQ3Ko.6s7LENcqpSMXmddC4gbq1qbQG7LM6eG', '2026-03-03 05:18:58', 0, '2026-03-02 21:18:58', '2026-03-02 21:16:54', '2026-03-02 21:18:58'),
(28, 'emmanllamas052@gmail.com', '$2y$12$cB81mqB/7ZMihMnQeeY0GuUbVHcBd2czkhI4Xlai/aMhRIEKc.xYq', '2026-03-03 05:20:30', 0, '2026-03-02 21:20:30', '2026-03-02 21:18:58', '2026-03-02 21:20:30'),
(29, 'emmanlabwork@gmail.com', '$2y$12$8XEHEorlDOjsrirtS7qWAOKvWcNgR3mC078mXEmGZ4EcfCSenptJe', '2026-03-03 05:29:29', 0, '2026-03-02 21:29:29', '2026-03-02 21:28:42', '2026-03-02 21:29:29'),
(30, 'emmanllamas052@gmail.com', '$2y$12$NWeJXOCH8G4N.bT720FBU.jA/6vUI7vKxqwVUbH/yyreZB40fPocq', '2026-03-03 06:19:16', 0, '2026-03-02 22:19:16', '2026-03-02 22:17:53', '2026-03-02 22:19:16'),
(31, 'emmanllamas052@gmail.com', '$2y$12$mXDMG7WYzUooqTlBDQGlIePJI8/kG0mKxpWpZnBM9Dk89uEWfrI1q', '2026-03-03 07:52:05', 0, '2026-03-02 23:52:05', '2026-03-02 23:51:44', '2026-03-02 23:52:05'),
(32, 'emmanllamas052@gmail.com', '$2y$12$H0qqBOj5xMv8BFE27WHjnO6.9.u6D3Y/1qeP4AVqceGyU3M10s0Ay', '2026-03-03 07:54:04', 0, '2026-03-02 23:54:04', '2026-03-02 23:53:43', '2026-03-02 23:54:04');

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
(9, '2026_02_26_130000_add_deleted_flags_to_purchase_requests_and_items', 3),
(10, '2026_03_02_100000_create_projects_table', 4),
(11, '2026_03_02_100100_create_procurement_modes_table', 4),
(12, '2026_03_02_100200_add_project_and_mode_fk_to_procurements_table', 4),
(13, '2026_03_02_101000_drop_legacy_project_and_mode_columns_from_procurements', 5),
(14, '2026_03_02_102000_add_search_indexes_to_procurements_table', 6),
(15, '2026_03_03_054000_make_requested_by_nullable_in_procurements', 6),
(16, '2026_03_02_103000_create_procurement_revisions_table', 7),
(17, '2026_03_03_000000_create_saros_table', 7);

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
(4, 2, 'procurement_submitted', 'New Procurement Submitted', 'GRANT ARACHEA submitted procurement PR-2026-000021 for review.', '{\"status\": \"pending\", \"requested_by\": 1, \"procurement_id\": 21, \"procurement_no\": \"PR-2026-000021\"}', NULL, '2026-02-25 16:49:32', '2026-02-25 16:49:32'),
(5, 2, 'procurement_submitted', 'New Procurement Submitted', 'GRANT ARACHEA submitted procurement PR-2026-000022 for review.', '{\"status\": \"pending\", \"requested_by\": 1, \"procurement_id\": 22, \"procurement_no\": \"PR-2026-000022\"}', NULL, '2026-03-01 22:42:40', '2026-03-01 22:42:40'),
(6, 2, 'procurement_submitted', 'New Procurement Submitted', 'emman llamas submitted procurement PR-2026-000023 for review.', '{\"procurement_id\":23,\"procurement_no\":\"PR-2026-000023\",\"status\":\"pending\",\"requested_by\":4}', NULL, '2026-03-02 21:45:17', '2026-03-02 21:45:17');

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
  `procurement_mode_id` bigint(20) UNSIGNED DEFAULT NULL,
  `project_id` bigint(20) UNSIGNED DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `description` text DEFAULT NULL,
  `requested_by` bigint(20) UNSIGNED DEFAULT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `procurements`
--

INSERT INTO `procurements` (`id`, `procurement_no`, `title`, `procurement_mode_id`, `project_id`, `status`, `description`, `requested_by`, `deleted`, `created_at`, `updated_at`) VALUES
(1, 'PR-2026-000001', 'Office Chairs', 5, 1, 'accepted', 'Need 20 ergonomic chairs', 1, 0, '2026-02-24 21:12:46', '2026-02-24 22:29:12'),
(2, 'PR-2026-000002', 'Office Chairs Retest', 5, 1, 'rejected', 'Retest procurement creation', 1, 0, '2026-02-24 21:40:36', '2026-02-24 22:29:24'),
(3, 'PR-2026-000003', 'Test Notification PR', 5, 2, 'pending', 'testing', 1, 0, '2026-02-24 22:14:42', '2026-02-24 22:14:42'),
(4, 'PR-2026-000004', 'Office Supply Batch #4', 3, 3, 'ongoing', 'Generated sample procurement record #4', 1, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(5, 'PR-2026-000005', 'Office Supply Batch #5', 5, 4, 'approved', 'Generated sample procurement record #5', 1, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(6, 'PR-2026-000006', 'Office Supply Batch #6', 5, 4, 'approved', 'Generated sample procurement record #6', 1, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(7, 'PR-2026-000007', 'Office Supply Batch #7', 3, 4, 'approved', 'Generated sample procurement record #7', 1, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(8, 'PR-2026-000008', 'Office Supply Batch #8', 3, 3, 'ongoing', 'Generated sample procurement record #8', 1, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(9, 'PR-2026-000009', 'Office Supply Batch #9', 5, 5, 'approved', 'Generated sample procurement record #9', 1, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(10, 'PR-2026-000010', 'Office Supply Batch #10', 5, 3, 'pending', 'Generated sample procurement record #10', 1, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(11, 'PR-2026-000011', 'Office Supply Batch #11', 7, 4, 'approved', 'Generated sample procurement record #11', 1, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(12, 'PR-2026-000012', 'Office Supply Batch #12', 5, 3, 'pending', 'Generated sample procurement record #12', 1, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(13, 'PR-2026-000013', 'Office Supply Batch #13', 5, 3, 'pending', 'Generated sample procurement record #13', 3, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(14, 'PR-2026-000014', 'Office Supply Batch #14', 7, 5, 'pending', 'Generated sample procurement record #14', 3, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(15, 'PR-2026-000015', 'Office Supply Batch #15', 5, 4, 'approved', 'Generated sample procurement record #15', 3, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(16, 'PR-2026-000016', 'Office Supply Batch #16', 3, 5, 'approved', 'Generated sample procurement record #16', 3, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(17, 'PR-2026-000017', 'Office Supply Batch #17', 3, 5, 'pending', 'Generated sample procurement record #17', 3, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(18, 'PR-2026-000018', 'Office Supply Batch #18', 3, 5, 'ongoing', 'Generated sample procurement record #18', 3, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(19, 'PR-2026-000019', 'Office Supply Batch #19', 7, 4, 'pending', 'Generated sample procurement record #19', 3, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(20, 'PR-2026-000020', 'Office Supply Batch #20', 5, 5, 'pending', 'Generated sample procurement record #20', 3, 0, '2026-02-25 16:28:26', '2026-02-25 16:28:26'),
(21, 'PR-2026-000021', 'Updated Procurement Title', 5, 6, 'pending', 'Updated notes', 3, 0, '2026-02-25 16:49:32', '2026-02-25 16:50:17'),
(22, 'PR-2026-000022', 'Test Procurement via Postman', 4, 21, 'pending', 'Testing FK-only procurement', 3, 0, '2026-03-01 22:42:40', '2026-03-01 22:42:40'),
(23, 'PR-2026-000023', 'ma ano ulam', 9, 21, 'pending', 'astug', 4, 0, '2026-03-02 21:45:17', '2026-03-02 21:45:17'),
(24, 'PR-2026-000024', 'malambing na pusa', 11, 7, 'pending', 'sobrang lambing', NULL, 0, '2026-03-02 21:49:07', '2026-03-02 21:49:07');

-- --------------------------------------------------------

--
-- Table structure for table `procurement_modes`
--

CREATE TABLE `procurement_modes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `legal_basis` varchar(100) NOT NULL DEFAULT 'RA 12009',
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `procurement_modes`
--

INSERT INTO `procurement_modes` (`id`, `code`, `name`, `legal_basis`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'CB', 'Competitive Bidding', 'RA 12009', NULL, 1, '2026-03-01 22:02:55', '2026-03-01 22:02:55'),
(2, 'LSB', 'Limited Source Bidding', 'RA 12009', NULL, 1, '2026-03-01 22:02:55', '2026-03-01 22:02:55'),
(3, 'CD', 'Competitive Dialogue', 'RA 12009', NULL, 1, '2026-03-01 22:02:55', '2026-03-01 22:02:55'),
(4, 'UOBM', 'Unsolicited Offer with Bid Matching', 'RA 12009', NULL, 1, '2026-03-01 22:02:55', '2026-03-01 22:02:55'),
(5, 'DC', 'Direct Contracting', 'RA 12009', NULL, 1, '2026-03-01 22:02:55', '2026-03-01 22:02:55'),
(6, 'RO', 'Repeat Order', 'RA 12009', NULL, 1, '2026-03-01 22:02:55', '2026-03-01 22:02:55'),
(7, 'SMP', 'Small Value Procurement', 'RA 12009', NULL, 1, '2026-03-01 22:02:55', '2026-03-01 22:02:55'),
(8, 'NP', 'Negotiated Procurement', 'RA 12009', NULL, 1, '2026-03-01 22:18:44', '2026-03-01 22:18:44'),
(9, 'DS', 'Direct Sales', 'RA 12009', NULL, 1, '2026-03-01 22:18:44', '2026-03-01 22:18:44'),
(10, 'DPSTI', 'Direct Procurement for Science, Technology, and Innovation', 'RA 12009', NULL, 1, '2026-03-01 22:18:44', '2026-03-01 22:18:44'),
(11, 'DA', 'Direct Acquisition', 'RA 12009', NULL, 1, '2026-03-01 22:18:44', '2026-03-01 22:18:44');

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
(2, 21, 'hahah.pdf', 'procurements/21/EQpNtfGd40kyYbG27gTgKBIzo7HlQvBnLmh6ak6e.pdf', '{\"signed\": true, \"remarks\": \"initial upload\", \"complete\": true}', '2026-02-25 16:52:19', '2026-02-25 16:52:19'),
(3, 23, 'Procurement-System.pdf', 'procurements/23/p9gcGXNOhkCrC7DjpOov7FMK8ExSbuDoDuk313zz.pdf', '{\"type\":\"project_procurement_management_plan\"}', '2026-03-02 21:45:18', '2026-03-02 21:45:18'),
(4, 24, 'Distribution of UNDP Tablets to Pangasinan Beneficiaries (2).pdf', 'procurements/24/7K8oqqhefpCnNxwFlEiX1mrYmNsxo8C3vYefQWCZ.pdf', '{\"type\":\"project_procurement_management_plan\"}', '2026-03-02 21:49:07', '2026-03-02 21:49:07');

-- --------------------------------------------------------

--
-- Table structure for table `procurement_revisions`
--

CREATE TABLE `procurement_revisions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `procurement_id` bigint(20) UNSIGNED NOT NULL,
  `actor_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` bigint(20) UNSIGNED NOT NULL,
  `before_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`before_data`)),
  `after_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`after_data`)),
  `changed_fields` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`changed_fields`)),
  `reason` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `name`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Free WI-FI for all', NULL, 1, '2026-03-01 22:02:55', '2026-03-01 22:02:55'),
(2, 'Government Network', NULL, 1, '2026-03-01 22:02:55', '2026-03-01 22:02:55'),
(3, 'National Broadband Program', NULL, 1, '2026-03-01 22:02:55', '2026-03-01 22:02:55'),
(4, 'Government Emergency Communication System', NULL, 1, '2026-03-01 22:02:55', '2026-03-01 22:02:55'),
(5, 'eReport', NULL, 1, '2026-03-01 22:02:55', '2026-03-01 22:02:55'),
(6, 'eGOVPH', NULL, 1, '2026-03-01 22:02:55', '2026-03-01 22:02:55'),
(7, 'eLGU-iBPLS', NULL, 1, '2026-03-01 22:18:44', '2026-03-01 22:18:44'),
(8, 'eTRAVEL', NULL, 1, '2026-03-01 22:18:44', '2026-03-01 22:18:44'),
(9, 'eGovCloud', NULL, 1, '2026-03-01 22:18:44', '2026-03-01 22:18:44'),
(10, 'eGovPay', NULL, 1, '2026-03-01 22:18:44', '2026-03-01 22:18:44'),
(11, 'ICT Literacy and Competency development Bureau', NULL, 1, '2026-03-01 22:18:44', '2026-03-01 22:18:44'),
(12, 'SPARK', NULL, 1, '2026-03-01 22:18:44', '2026-03-01 22:18:44'),
(13, 'TECH4ED-DTC', NULL, 1, '2026-03-01 22:18:44', '2026-03-01 22:18:44'),
(14, 'Cybersecurity Awareness', NULL, 1, '2026-03-01 22:18:44', '2026-03-01 22:18:44'),
(15, 'National Government Portal', NULL, 1, '2026-03-01 22:18:44', '2026-03-01 22:18:44'),
(16, 'PNPKI', NULL, 1, '2026-03-01 22:18:44', '2026-03-01 22:18:44'),
(17, 'ICT Industry Development Bureau', NULL, 1, '2026-03-01 22:18:44', '2026-03-01 22:18:44'),
(18, 'Digital Governance Award', NULL, 1, '2026-03-01 22:18:44', '2026-03-01 22:18:44'),
(19, 'Digital Cities', NULL, 1, '2026-03-01 22:18:44', '2026-03-01 22:18:44'),
(20, 'Digiral Startup Development and Acceleration Program', NULL, 1, '2026-03-01 22:18:44', '2026-03-01 22:18:44'),
(21, 'DVAS', NULL, 1, '2026-03-01 22:18:44', '2026-03-01 22:18:44'),
(61, 'naaay', NULL, 1, '2026-03-02 18:40:09', '2026-03-02 18:40:09');

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
(21, 21, 'PUR-2026-000021', 'Admin Office', '2026-02-26', 'RCC-001', 'Office seating replacement', 0, '2026-02-25 16:49:32', '2026-02-25 16:49:32'),
(22, 22, 'PUR-2026-000022', 'Admin Office', '2026-03-02', 'RCC-001', 'System test', 0, '2026-03-01 22:42:40', '2026-03-01 22:42:40'),
(23, 23, 'PUR-2026-000023', 'DICT Regional Office I', '2026-03-03', 'N/A', 'ma ano ulam', 0, '2026-03-02 21:45:17', '2026-03-02 21:45:17'),
(24, 24, 'PUR-2026-000024', 'DICT Regional Office I', '2026-03-03', 'N/A', 'malambing na pusa', 0, '2026-03-02 21:49:07', '2026-03-02 21:49:07');

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
(2, 'adq', 'chair', 'ojt', 'Budget Officer', '2026-02-24 21:09:10', '2026-02-24 21:09:10'),
(3, 'adq', 'chair', 'ojt', 'user', '2026-02-24 21:09:10', '2026-02-24 21:09:10');

-- --------------------------------------------------------

--
-- Table structure for table `sadmin`
--

CREATE TABLE `sadmin` (
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
-- Dumping data for table `sadmin`
--

INSERT INTO `sadmin` (`id`, `last_name`, `first_name`, `middle_name`, `email`, `username`, `access_type`, `role_id`, `is_active`, `is_authorized`, `active_session_id`, `active_device_fingerprint`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'dela cruz', 'juan', 'jollibee', 'emmanlabwork@gmail.com', 'jdelacruz01', 'super admin\r\n', NULL, 1, 1, 'K2srxtU0nNdotmy0tJe7aW4SiwHArr5TdvyPq1YA', NULL, NULL, NULL, '2026-03-02 21:29:29');

-- --------------------------------------------------------

--
-- Table structure for table `saros`
--

CREATE TABLE `saros` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `procurement_id` bigint(20) UNSIGNED NOT NULL,
  `uploaded_by` bigint(20) UNSIGNED DEFAULT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(1000) NOT NULL,
  `mime_type` varchar(150) NOT NULL,
  `file_size` bigint(20) UNSIGNED NOT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
('Ihm1fWh4eOMVjLfriVHS18vqWxUy6286QhuQT9XV', 4, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiRnJLMTVwZzRsaXZNaVRxRk1iTzlYenExYUtGanpzSnZ5QzU0U2FSaCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDc6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9wcm9jdXJlbWVudHM/cGVyX3BhZ2U9MTAwIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aTo0O30=', 1772524517),
('K2srxtU0nNdotmy0tJe7aW4SiwHArr5TdvyPq1YA', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'YTo1OntzOjY6Il90b2tlbiI7czo0MDoiN0Z4MDh0VXBwOXQ1TlQ5Qkl3SHozdWxNbllYeHVmdnZ4WEszTnpHSiI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo5OiJzYWRtaW5faWQiO2k6MTtzOjEyOiJzYWRtaW5fZW1haWwiO3M6MjI6ImVtbWFubGFid29ya0BnbWFpbC5jb20iO3M6OToiX3ByZXZpb3VzIjthOjI6e3M6MzoidXJsIjtzOjM0OiJodHRwOi8vbG9jYWxob3N0OjgwMDAvc2FkbWluL3VzZXJzIjtzOjU6InJvdXRlIjtOO319', 1772524269),
('W5lrPKqawGMUtZ2vXAXLj2RrdDixCSpm8mvOVCbY', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiNjBZa2duN3BNZVF6ZTRnUkthMzRXREJQcVF0ODRTQWo0bWlGY0JqRCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mjk6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9hdXRoL21lIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1772524301),
('XhXezOR5PyKVGQZx8aLJnELBcNyLnS31LScnKdqp', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiMmRHTzNxYmZYWndCZ3JtMENlcXRCOW1RZUh2QlNUN3NLMTBTVjNSNCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1772524285);

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
(1, 'ARACHEA', 'GRANT', 'liwanag', 'grantarachea@gmail.com', 'hey', 'user', 1, 0, 1, '5wwn3r85SnS8rGTIK8Z8TDozyOBQ732KpvD19uvK', '8ae1e060b74b9ba4317a7197c1e1f1311c940063092506dad797bde2e847d2bf', NULL, '2026-02-24 21:09:10', '2026-03-02 18:13:11'),
(2, 'OfficerTwo', 'Budget', NULL, 'grantarachea09@gmail.com', 'budget.officer2', 'budget_officer', 2, 1, 1, 'nvnbaN4tHhSJVGlCi9OJkPOUKmP4tvsXyJPEiR3X', 'c0dea510547aa0374f156589f64c513b66b9c095b96ad11ef6794dcf088ce889', NULL, '2026-02-24 22:02:55', '2026-02-24 22:54:41'),
(3, 'Aspa', 'Kimberly', 'Catalma', 'aspakimberly@gmail.com', 'kimz', 'user', 3, 1, 1, NULL, NULL, NULL, '2026-02-24 22:02:55', '2026-02-24 22:54:41'),
(4, 'llamas', 'emman', 'haha', 'emmanllamas052@gmail.com', 'emmansusss', 'astig', NULL, 1, 1, 'Ihm1fWh4eOMVjLfriVHS18vqWxUy6286QhuQT9XV', 'ab8cd1890ab0fe61072d7a643e16d36a879a22bd9ac35bb0b26b46c8ca8450e5', NULL, NULL, '2026-03-02 23:54:04');

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
  ADD KEY `procurements_requested_by_foreign` (`requested_by`),
  ADD KEY `procurements_procurement_mode_id_foreign` (`procurement_mode_id`),
  ADD KEY `procurements_project_id_procurement_mode_id_index` (`project_id`,`procurement_mode_id`),
  ADD KEY `procurements_status_idx` (`status`),
  ADD KEY `procurements_deleted_idx` (`deleted`),
  ADD KEY `procurements_created_at_idx` (`created_at`),
  ADD KEY `procurements_requested_by_idx` (`requested_by`),
  ADD KEY `procurements_deleted_updated_id_idx` (`deleted`,`updated_at`,`id`);

--
-- Indexes for table `procurement_modes`
--
ALTER TABLE `procurement_modes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `procurement_modes_name_unique` (`name`),
  ADD UNIQUE KEY `procurement_modes_code_unique` (`code`);

--
-- Indexes for table `procurement_pdfs`
--
ALTER TABLE `procurement_pdfs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `procurement_pdfs_procurement_id_foreign` (`procurement_id`);

--
-- Indexes for table `procurement_revisions`
--
ALTER TABLE `procurement_revisions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proc_rev_proc_created_idx` (`procurement_id`,`created_at`),
  ADD KEY `proc_rev_actor_idx` (`actor_user_id`),
  ADD KEY `proc_rev_entity_idx` (`entity_type`,`entity_id`),
  ADD KEY `proc_rev_action_idx` (`action`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `projects_name_unique` (`name`);

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
-- Indexes for table `sadmin`
--
ALTER TABLE `sadmin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `users_username_unique` (`username`),
  ADD KEY `users_role_id_index` (`role_id`),
  ADD KEY `users_active_session_id_index` (`active_session_id`);

--
-- Indexes for table `saros`
--
ALTER TABLE `saros`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `saros_procurement_id_unique` (`procurement_id`),
  ADD KEY `saros_uploaded_by_index` (`uploaded_by`),
  ADD KEY `saros_created_at_index` (`created_at`);

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `login_otps`
--
ALTER TABLE `login_otps`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `procurements`
--
ALTER TABLE `procurements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `procurement_modes`
--
ALTER TABLE `procurement_modes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `procurement_pdfs`
--
ALTER TABLE `procurement_pdfs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `procurement_revisions`
--
ALTER TABLE `procurement_revisions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT for table `purchase_requests`
--
ALTER TABLE `purchase_requests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `sadmin`
--
ALTER TABLE `sadmin`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `saros`
--
ALTER TABLE `saros`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

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
  ADD CONSTRAINT `procurements_procurement_mode_id_foreign` FOREIGN KEY (`procurement_mode_id`) REFERENCES `procurement_modes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `procurements_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `procurements_requested_by_foreign` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `procurement_pdfs`
--
ALTER TABLE `procurement_pdfs`
  ADD CONSTRAINT `procurement_pdfs_procurement_id_foreign` FOREIGN KEY (`procurement_id`) REFERENCES `procurements` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `procurement_revisions`
--
ALTER TABLE `procurement_revisions`
  ADD CONSTRAINT `procurement_revisions_actor_user_id_foreign` FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `procurement_revisions_procurement_id_foreign` FOREIGN KEY (`procurement_id`) REFERENCES `procurements` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `purchase_requests`
--
ALTER TABLE `purchase_requests`
  ADD CONSTRAINT `purchase_requests_procurement_id_foreign` FOREIGN KEY (`procurement_id`) REFERENCES `procurements` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `saros`
--
ALTER TABLE `saros`
  ADD CONSTRAINT `saros_procurement_id_foreign` FOREIGN KEY (`procurement_id`) REFERENCES `procurements` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `saros_uploaded_by_foreign` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
