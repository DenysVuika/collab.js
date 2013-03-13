/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

-- Dumping database structure for collabjs
CREATE DATABASE IF NOT EXISTS `collabjs` /*!40100 DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci */;
USE `collabjs`;


-- Dumping structure for table collabjs.comments
CREATE TABLE IF NOT EXISTS `comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `postId` int(11) NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `content` text COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_Comments_Posts_idx` (`postId`),
  KEY `FK_Comments_Users_idx` (`userId`),
  CONSTRAINT `FK_Comments_Posts` FOREIGN KEY (`postId`) REFERENCES `posts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_Comments_Users` FOREIGN KEY (`userId`) REFERENCES `users` (`Id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Data exporting was unselected.


-- Dumping structure for procedure collabjs.get_account
DELIMITER //
CREATE PROCEDURE `get_account`(IN account VARCHAR(50))
BEGIN
SELECT u.*, emailHash as pictureId, get_user_roles(u.id) AS roles
FROM users AS u 
WHERE u.account = account
LIMIT 1;
END//
DELIMITER ;


-- Dumping structure for procedure collabjs.get_account_by_id
DELIMITER //
CREATE PROCEDURE `get_account_by_id`(IN uid INT)
BEGIN
SELECT u.*, emailHash as pictureId, get_user_roles(u.id) AS roles
FROM users AS u 
WHERE u.id = uid
LIMIT 1;
END//
DELIMITER ;


-- Dumping structure for procedure collabjs.get_comments
DELIMITER //
CREATE PROCEDURE `get_comments`(IN `postId` INT)
BEGIN
SELECT c.*, u.account, u.name, u.emailHash as pictureId
FROM comments AS c 
	LEFT JOIN users AS u ON u.id = c.userId 
WHERE c.postId = postId
ORDER BY created ASC;
END//
DELIMITER ;


-- Dumping structure for procedure collabjs.get_followers
DELIMITER //
CREATE PROCEDURE `get_followers`(IN `originatorId` INT, IN `targetAccount` VARCHAR(50), IN topId INT)
BEGIN

DECLARE targetId INT;
SELECT u.id INTO targetId FROM users AS u  WHERE u.account = targetAccount;

SELECT result.* FROM
(
SELECT
	u.id, u.account, u.name, u.website, u.location, u.bio, u.emailHash as pictureId,
	COUNT(p.id) as posts,
	(SELECT COUNT(id) FROM subscriptions WHERE userId = u.id) AS following,
	(SELECT COUNT(id) FROM subscriptions WHERE targetUserId = u.id) AS followers,
	(SELECT IF(u.id = originatorId, TRUE, FALSE)) AS isOwnProfile,
	(SELECT IF ( 
		(
			SELECT COUNT(*) FROM subscriptions AS sub
				LEFT JOIN users AS usource ON usource.id = sub.userId
				LEFT JOIN users AS utarget ON utarget.id = sub.targetUserId 
			WHERE usource.Id = originatorId AND utarget.account = u.account
			GROUP BY sub.id
			) > 0, TRUE, FALSE
	)) AS isFollowed
FROM subscriptions AS s
	LEFT JOIN users AS u ON u.id = s.userId
	LEFT JOIN posts AS p ON p.userId = u.id
WHERE s.targetUserId = targetId 
	AND EXISTS (select id from users where id = topId OR topId = 0)
GROUP BY s.id
) AS result
WHERE (topId <= 0 || result.id > topId)
LIMIT 20;
END//
DELIMITER ;


-- Dumping structure for procedure collabjs.get_following
DELIMITER //
CREATE PROCEDURE `get_following`(IN `originatorId` INT, IN `targetAccount` VARCHAR(50), IN topId INT)
BEGIN
DECLARE targetId INT;
SELECT u.id INTO targetId FROM users AS u  WHERE u.account = targetAccount;

SELECT result.* FROM
(
SELECT
	u.id, u.account, u.name, u.website, u.location, u.bio, u.emailHash as pictureId,
	COUNT(p.id) as posts,
	(SELECT COUNT(id) FROM subscriptions WHERE userId = u.id) AS following,
	(SELECT COUNT(id) FROM subscriptions WHERE targetUserId = u.id) AS followers,
	(SELECT IF(u.id = originatorId, TRUE, FALSE)) AS isOwnProfile,
	(SELECT IF ( 
		(
			SELECT COUNT(*) FROM subscriptions AS sub
				LEFT JOIN users AS usource ON usource.id = sub.userId
				LEFT JOIN users AS utarget ON utarget.id = sub.targetUserId 
			WHERE usource.Id = originatorId AND utarget.account = u.account
			GROUP BY sub.id
			) > 0, TRUE, FALSE
	)) AS isFollowed
FROM subscriptions AS s
	LEFT JOIN users AS u ON u.id = s.targetUserId
	LEFT JOIN posts AS p ON p.userId = u.id
WHERE s.userId = targetId
	AND EXISTS (select id from users where id = topId OR topId = 0)
GROUP BY s.id
) AS result
WHERE (topId <= 0 || result.id > topId)
LIMIT 20;
END//
DELIMITER ;


-- Dumping structure for procedure collabjs.get_main_timeline
DELIMITER //
CREATE PROCEDURE `get_main_timeline`(IN `originatorId` INT, IN topId INT)
BEGIN
SELECT result.* FROM
(
SELECT p.*, u.name, u.account, u.emailHash as pictureId,
    COUNT(c.id) AS commentsCount
FROM posts AS p
	LEFT JOIN users AS u ON u.id = p.userId
	LEFT JOIN comments AS c ON c.postId = p.id
WHERE p.userId IN (
	SELECT s.targetUserId FROM subscriptions AS s
	WHERE s.userId = originatorId AND s.isBlocked = FALSE
	UNION SELECT originatorId
)
AND EXISTS (select id from posts where id = topId OR topId = 0)
GROUP BY p.id
ORDER BY p.created DESC
) as result
WHERE (topId <= 0 || result.id < topId)
LIMIT 20;
END//
DELIMITER ;


-- Dumping structure for procedure collabjs.get_mentions
DELIMITER //
CREATE PROCEDURE `get_mentions`(IN `originatorAccount` VARCHAR(50), IN topId INT)
BEGIN
DECLARE term VARCHAR(51);
SET term = CONCAT('%@', originatorAccount, '%');
SELECT result.* FROM
(
SELECT p.*, u.name, u.account, u.emailHash as pictureId,
    COUNT(c.id) AS commentsCount
FROM posts AS p
	LEFT JOIN users AS u ON u.id = p.userId
	LEFT JOIN comments AS c ON c.postId = p.id
WHERE u.account != originatorAccount AND p.content LIKE term
AND EXISTS (select id from posts where id = topId OR topId = 0)
GROUP BY p.id
ORDER BY p.created DESC
) AS result
WHERE (topId <= 0 || result.id < topId)
LIMIT 20;
END//
DELIMITER ;


-- Dumping structure for procedure collabjs.get_people
DELIMITER //
CREATE PROCEDURE `get_people`(IN `originatorId` INT, IN topId INT)
BEGIN
SELECT result.* FROM
(
SELECT u.id, u.account, u.name, u.website, u.location, u.bio, u.emailHash as pictureId,
	COUNT(p.id) AS posts,
	(SELECT COUNT(id) FROM subscriptions WHERE userId = u.id) AS following,
	(SELECT COUNT(id) FROM subscriptions WHERE targetUserId = u.id) AS followers,
	(SELECT IF ( 
		(
			SELECT COUNT(*) FROM subscriptions AS sub
				LEFT JOIN users AS usource ON usource.id = sub.userId
				LEFT JOIN users AS utarget ON utarget.id = sub.targetUserId 
			WHERE usource.Id = originatorId AND utarget.account = u.account
			GROUP BY sub.id
			) > 0, TRUE, FALSE
	)) AS isFollowed,
	(SELECT IF(u.id = originatorId, TRUE, FALSE)) AS isOwnProfile
FROM users AS u
	LEFT JOIN posts AS p ON p.userId = u.id
WHERE EXISTS (select id from users where id = topId OR topId = 0)
GROUP BY u.id
ORDER BY u.created ASC
) AS result
WHERE (topId <= 0 || result.id > topId)
LIMIT 20;
END//
DELIMITER ;


-- Dumping structure for procedure collabjs.get_post_author
DELIMITER //
CREATE PROCEDURE `get_post_author`(IN postId INT)
BEGIN
select u.id, u.account, u.name, u.email, u.emailHash as pictureId
from posts as p 
left join users as u on u.id = p.userId 
where p.id = postId
limit 1;
END//
DELIMITER ;


-- Dumping structure for procedure collabjs.get_post_full
DELIMITER //
CREATE PROCEDURE `get_post_full`(IN `postId` INT)
BEGIN
SELECT p.*, u.name, u.account, u.emailHash as pictureId
FROM posts AS p
	LEFT JOIN users AS u ON u.id = p.userId
	LEFT JOIN comments AS c ON c.postId = p.id
WHERE p.id = postId
ORDER BY p.id;

SELECT c.*, u.account, u.name, u.emailHash as pictureId
FROM comments AS c 
	LEFT JOIN users AS u ON u.id = c.userId 
WHERE c.postId = postId 
ORDER BY created ASC;
END//
DELIMITER ;


-- Dumping structure for procedure collabjs.get_public_profile
DELIMITER //
CREATE PROCEDURE `get_public_profile`(IN `originator` VARCHAR(50), IN `target` VARCHAR(50))
BEGIN

select u.id, u.account, u.name, u.website, u.bio, u.emailHash as pictureId,
		count(p.id) as posts,
		(select count(id) from subscriptions where userId = u.id) as following,
		(select count(id) from subscriptions where targetUserId = u.id) as followers,
		(select if ( 
			(
				select count(*) 
					from subscriptions as sub
						left join users as usource on usource.id = sub.userId
						left join users as utarget on utarget.id = sub.targetUserId 
					where usource.account = originator and utarget.account = u.account
				group by sub.id
			) > 0, TRUE, FALSE
		)) as isFollowed
from users as u
	left join posts as p on p.userId = u.id
where u.account = target
group by u.id;

END//
DELIMITER ;


-- Dumping structure for procedure collabjs.get_timeline
DELIMITER //
CREATE PROCEDURE `get_timeline`(IN `targetAccount` VARCHAR(50), IN topId INT)
BEGIN
SELECT result.* FROM
(
SELECT p.*, u.name, u.account, u.emailHash as pictureId,
    COUNT(c.id) AS commentsCount
FROM posts AS p
	LEFT JOIN users AS u ON u.id = p.userId
	LEFT JOIN comments AS c ON c.postId = p.id
WHERE u.account = targetAccount
AND EXISTS (select id from posts where userId = p.userId AND (id = topId OR topId = 0))
GROUP BY p.id
ORDER BY p.created DESC
) AS result
WHERE (topId <= 0 || result.id < topId)
LIMIT 20;
END//
DELIMITER ;


-- Dumping structure for procedure collabjs.get_timeline_updates
DELIMITER //
CREATE PROCEDURE `get_timeline_updates`(IN `originatorId` INT, IN topId INT)
BEGIN
SELECT result.* FROM
(
SELECT p.*, u.name, u.account, u.emailHash as pictureId,
    COUNT(c.id) AS commentsCount
FROM posts AS p
	LEFT JOIN users AS u ON u.id = p.userId
	LEFT JOIN comments AS c ON c.postId = p.id
WHERE p.userId IN (
	SELECT s.targetUserId FROM subscriptions AS s
	WHERE s.userId = originatorId AND s.isBlocked = FALSE
	UNION SELECT originatorId
)
GROUP BY p.id
ORDER BY p.created ASC
) as result
WHERE result.id > topId AND topId > 0;
END//
DELIMITER ;


-- Dumping structure for procedure collabjs.get_timeline_updates_count
DELIMITER //
CREATE PROCEDURE `get_timeline_updates_count`(IN `originatorId` INT, IN topId INT)
BEGIN
SELECT COUNT(result.id) as posts FROM
(
SELECT p.*, u.name, u.account, COUNT(c.id) AS commentsCount 
FROM posts AS p
	LEFT JOIN users AS u ON u.id = p.userId
	LEFT JOIN comments AS c ON c.postId = p.id
WHERE p.userId IN (
	SELECT s.targetUserId FROM subscriptions AS s
	WHERE s.userId = originatorId AND s.isBlocked = FALSE
	UNION SELECT originatorId
)
GROUP BY p.id
ORDER BY p.created DESC
) as result
WHERE result.id > topId AND topId > 0;
END//
DELIMITER ;


-- Dumping structure for function collabjs.get_user_roles
DELIMITER //
CREATE FUNCTION `get_user_roles`(uid INT) RETURNS varchar(1000) CHARSET utf8
BEGIN
DECLARE result VARCHAR(1000);

SET result = (SELECT GROUP_CONCAT(r.loweredName separator ',') AS roles
FROM roles AS r, user_roles AS ur
WHERE r.id = ur.roleId AND ur.userId = uid
ORDER BY r.loweredName);

RETURN result;
END//
DELIMITER ;

-- Dumping structure for table collabjs.posts
CREATE TABLE IF NOT EXISTS `posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `content` text COLLATE utf8_unicode_ci NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `FK_Posts_Users_idx` (`userId`),
  CONSTRAINT `FK_Posts_Users` FOREIGN KEY (`userId`) REFERENCES `users` (`Id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Data exporting was unselected.


-- Dumping structure for table collabjs.roles
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
  `loweredName` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Data exporting was unselected.


-- Dumping structure for procedure collabjs.subscribe_account
DELIMITER //
CREATE PROCEDURE `subscribe_account`(IN `originatorId` INT, IN `targetAccount` VARCHAR(50))
BEGIN
DECLARE targetId INT;
SELECT u.id INTO targetId FROM users AS u  WHERE u.account = targetAccount;

INSERT INTO subscriptions (userId, targetUserId) 
	SELECT * FROM (SELECT originatorId, targetId) as tmp
	WHERE NOT EXISTS(
		SELECT s.id FROM subscriptions AS s
			LEFT JOIN users AS usource ON usource.id = s.userId
			LEFT JOIN users AS utarget ON utarget.id = s.targetUserId
		WHERE usource.id = originatorId AND utarget.id = targetId
		ORDER BY s.id
	) LIMIT 1;
END//
DELIMITER ;


-- Dumping structure for table collabjs.subscriptions
CREATE TABLE IF NOT EXISTS `subscriptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `targetUserId` int(11) NOT NULL,
  `isBlocked` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`),
  KEY `FK_Subscriptions_Users_Left_idx` (`userId`),
  KEY `FK_Subscriptions_Users_Right_idx` (`targetUserId`),
  CONSTRAINT `FK_Subscriptions_Users_Left` FOREIGN KEY (`userId`) REFERENCES `users` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_Subscriptions_Users_Right` FOREIGN KEY (`targetUserId`) REFERENCES `users` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Data exporting was unselected.


-- Dumping structure for procedure collabjs.unsubscribe_account
DELIMITER //
CREATE PROCEDURE `unsubscribe_account`(IN `originatorId` INT, IN `targetAccount` VARCHAR(50))
BEGIN
DECLARE targetId INT;
SELECT u.id INTO targetId FROM users AS u  WHERE u.account = targetAccount;
DELETE FROM subscriptions WHERE userId = originatorId AND targetUserId = targetId;
END//
DELIMITER ;


-- Dumping structure for table collabjs.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `account` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `name` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `password` varchar(128) COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
  `emailHash` varchar(32) NOT NULL DEFAULT '00000000000000000000000000000000',
  `location` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `website` varchar(256) COLLATE utf8_unicode_ci DEFAULT NULL,
  `bio` varchar(160) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `account` (`account`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Data exporting was unselected.


-- Dumping structure for table collabjs.user_roles
CREATE TABLE IF NOT EXISTS `user_roles` (
  `userId` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  `roleId` int(11) NOT NULL,
  PRIMARY KEY (`userId`,`roleId`),
  KEY `FK_ur_user_idx` (`userId`),
  KEY `FK_ur_role_idx` (`roleId`),
  CONSTRAINT `FK_ur_user` FOREIGN KEY (`userId`) REFERENCES `users` (`account`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_ur_role` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- v.0.2.0

DELIMITER //
CREATE PROCEDURE get_posts_by_hashtag (
	IN `tag` VARCHAR(250),
	IN `topId` INT
)
BEGIN
DECLARE term VARCHAR(256);
SET term = CONCAT('%', `tag`, '%');
SELECT result.* FROM
(
SELECT p.*, u.name, u.account, COUNT(c.id) AS commentsCount
FROM posts AS p
	LEFT JOIN users AS u ON u.id = p.userId
	LEFT JOIN comments AS c ON c.postId = p.id
WHERE p.content LIKE term
AND EXISTS (select id from posts where id = topId OR topId = 0)
GROUP BY p.id
ORDER BY p.created DESC
) AS result
WHERE (topId <= 0 || result.id < topId)
LIMIT 20;
END//
DELIMITER ;

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;