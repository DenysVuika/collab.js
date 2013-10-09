-- v.0.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

CREATE DATABASE IF NOT EXISTS `collabjs` /*!40100 DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci */;
USE `collabjs`;

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

DELIMITER //
CREATE PROCEDURE `get_main_timeline`(
  IN `originatorId` INT,
  IN topId INT)
BEGIN
  SELECT result.* FROM
  (
    SELECT p.*, u.name, u.account, u.emailHash as pictureId
    FROM posts AS p
      LEFT JOIN users AS u ON u.id = p.userId
    WHERE p.userId IN (
      SELECT f.targetId FROM `following` AS f WHERE f.userId = originatorId
      UNION SELECT originatorId
    )
    AND NOT EXISTS (SELECT id FROM hidden_posts AS hp WHERE hp.userId = originatorId AND hp.postId = p.id)
    AND EXISTS (SELECT id FROM posts WHERE id = topId OR topId = 0)
    GROUP BY p.id
    ORDER BY p.created DESC
  ) as result
  WHERE (topId <= 0 || result.id < topId)
  LIMIT 20;
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE `get_mentions`(
  IN `originatorId` INT,
  IN `originatorAccount` VARCHAR(50),
  IN topId INT)
BEGIN
  DECLARE term VARCHAR(51);
  SET term = CONCAT('%@', originatorAccount, '%');
  SELECT result.* FROM
  (
    SELECT p.*, u.name, u.account, u.emailHash as pictureId
    FROM posts AS p
      LEFT JOIN users AS u ON u.id = p.userId
    WHERE u.account != originatorAccount AND p.content LIKE term
    AND NOT EXISTS (SELECT id FROM hidden_posts AS hp WHERE hp.userId = originatorId AND hp.postId = p.id)
    AND EXISTS (select id from posts where id = topId OR topId = 0)
    GROUP BY p.id
    ORDER BY p.created DESC
  ) AS result
  WHERE (topId <= 0 || result.id < topId)
  LIMIT 20;
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE `get_people`(
  IN `originatorId` INT,
  IN topId INT)
BEGIN
  SELECT result.* FROM
  (
    SELECT u.id, u.account, u.name, u.website, u.location, u.bio, u.emailHash as pictureId, u.posts, u.following, u.followers,
    (SELECT IF(u.id = originatorId, TRUE, FALSE)) AS isOwnProfile,
    (SELECT IF ((SELECT COUNT(userId) FROM `following` WHERE userId = originatorId AND targetId = u.id) > 0, TRUE, FALSE)) AS isFollowed
    FROM users AS u
    WHERE EXISTS (select id from users where id = topId OR topId = 0)
    GROUP BY u.id
    ORDER BY u.created ASC
  ) AS result
  WHERE (topId <= 0 || result.id > topId)
  LIMIT 20;
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE `get_post_full`(
  IN `postId` INT)
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

DELIMITER //
CREATE PROCEDURE `get_timeline`(
  IN `originatorId` INT,
  IN `targetAccount` VARCHAR(50),
  IN topId INT)
BEGIN
  SELECT result.* FROM
  (
    SELECT p.*, u.name, u.account, u.emailHash as pictureId
    FROM posts AS p
      LEFT JOIN users AS u ON u.id = p.userId
    WHERE u.account = targetAccount
    AND NOT EXISTS (SELECT id FROM hidden_posts AS hp WHERE hp.userId = originatorId AND hp.postId = p.id)
    AND EXISTS (select id from posts where userId = p.userId AND (id = topId OR topId = 0))
    GROUP BY p.id
    ORDER BY p.created DESC
  ) AS result
  WHERE (topId <= 0 || result.id < topId)
  LIMIT 20;
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE `get_timeline_updates`(
  IN `originatorId` INT,
  IN topId INT)
BEGIN
  SELECT result.* FROM
  (
    SELECT p.*, u.name, u.account, u.emailHash as pictureId
    FROM posts AS p
      LEFT JOIN users AS u ON u.id = p.userId
    WHERE p.userId IN (
      SELECT f.targetId FROM `following` AS f WHERE f.userId = originatorId
      UNION SELECT originatorId
    )
    GROUP BY p.id
    ORDER BY p.created ASC
  ) as result
  WHERE result.id > topId AND topId > 0;
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE `get_timeline_updates_count`(
  IN `originatorId` INT,
  IN topId INT)
BEGIN
  SELECT COUNT(result.id) as posts FROM
  (
    SELECT p.*, u.name, u.account
    FROM posts AS p
      LEFT JOIN users AS u ON u.id = p.userId
    WHERE p.userId IN (
      SELECT f.targetId FROM `following` AS f WHERE f.userId = originatorId
      UNION SELECT originatorId
    )
    GROUP BY p.id
    ORDER BY p.created DESC
  ) as result
  WHERE result.id > topId AND topId > 0;
END//
DELIMITER ;

CREATE TABLE IF NOT EXISTS `posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `content` text COLLATE utf8_unicode_ci NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `commentsCount` int(11) NOT NULL DEFAULT '0',
  `likesCount` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `FK_Posts_Users_idx` (`userId`),
  CONSTRAINT `FK_Posts_Users` FOREIGN KEY (`userId`) REFERENCES `users` (`Id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
  `loweredName` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

DELIMITER //
CREATE PROCEDURE `subscribe_account`(
  IN `originatorId` INT,
  IN `targetAccount` VARCHAR(50))
BEGIN
	DECLARE tid int DEFAULT 0;
	SELECT u.id INTO tid FROM users AS u WHERE u.account = targetAccount;
	IF (tid > 0) THEN
		INSERT IGNORE INTO `following` (userId, targetId)
			VALUES (originatorId, tid);
	END IF;
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE `unsubscribe_account`(
  IN `originatorId` INT,
  IN `targetAccount` VARCHAR(50))
BEGIN
      DECLARE tid INT DEFAULT 0;
      SELECT id INTO tid FROM users WHERE account = targetAccount;
    	IF (tid > 0) THEN
    		DELETE FROM `following` WHERE `userId` = originatorId AND `targetId` = tid;
    	END IF;
END//
DELIMITER ;

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
  `posts` int(11) NOT NULL DEFAULT '0',
  `comments` varchar(45) NOT NULL DEFAULT '0',
  `following` int(11) NOT NULL DEFAULT '0',
  `followers` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `account` (`account`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_roles` (
  `userId` int(11) NOT NULL,
  `roleId` int(11) NOT NULL,
  PRIMARY KEY (`userId`,`roleId`),
  KEY `FK_ur_user_idx` (`userId`),
  KEY `FK_ur_role_idx` (`roleId`),
  CONSTRAINT `FK_ur_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_ur_role` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

DELIMITER //
CREATE PROCEDURE get_posts_by_hashtag (
  IN `originatorId` INT,
	IN `tag` VARCHAR(250),
	IN `topId` INT
)
BEGIN
  DECLARE term VARCHAR(256);
  SET term = CONCAT('%', `tag`, '%');
  SELECT result.* FROM
  (
    SELECT p.*, u.name, u.account
    FROM posts AS p
      LEFT JOIN users AS u ON u.id = p.userId
    WHERE p.content LIKE term
    AND NOT EXISTS (SELECT id FROM hidden_posts AS hp WHERE hp.userId = originatorId AND hp.postId = p.id)
    AND EXISTS (SELECT id FROM posts WHERE id = topId OR topId = 0)
    GROUP BY p.id
    ORDER BY p.created DESC
  ) AS result
  WHERE (topId <= 0 || result.id < topId)
  LIMIT 20;
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE `delete_post`(
  IN userId INT,
  IN postId INT)
BEGIN
  DECLARE hidden int DEFAULT 0;
  DELETE FROM posts WHERE posts.id = postId AND posts.userId = userId;
  IF (ROW_COUNT() = 0) THEN
    SELECT 1 INTO hidden FROM hidden_posts AS hp
      WHERE hp.userId = userId AND hp.postId = postId;
    IF (hidden = 0) THEN
      INSERT INTO hidden_posts (`userId`, `postId`)
        VALUES (userId, postId);
    END IF;
  END IF;
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE `add_comment` (
	IN userId INT,
	IN postId INT,
	IN created TIMESTAMP,
	IN content TEXT)
BEGIN
  DECLARE subscribed INT DEFAULT 0;
  	DECLARE result INT default 0;
  	SELECT 1 INTO subscribed FROM posts AS p
  		WHERE p.id = postId
  			AND (EXISTS (
  				SELECT f.userId FROM `following` AS f
  				WHERE f.targetId = p.userId AND f.userId = userId)
  			OR p.userId = userId)
  	LIMIT 1;

  	IF (subscribed = 1) THEN
  		INSERT INTO comments (userId, postId, created, content)
  			VALUES (userId, postId, created, content);
  		SET result = last_insert_id();
  	END IF;

  	SELECT result AS `insertId`;
END//
DELIMITER ;

INSERT INTO roles (`name`, `loweredName`)
SELECT 'Administrator', 'administrator' FROM DUAL
WHERE NOT EXISTS (SELECT * FROM `roles` WHERE `loweredName` = 'administrator')
LIMIT 1;

CREATE  TABLE `hidden_posts` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `userId` INT NOT NULL ,
  `postId` INT NOT NULL ,
  PRIMARY KEY (`id`) );

CREATE  TABLE `search_lists` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `name` VARCHAR(45) NOT NULL ,
  `userId` INT NOT NULL ,
  `query` TEXT NOT NULL ,
  `source` VARCHAR(45) NOT NULL ,
  PRIMARY KEY (`id`),
  KEY `list_user_idx` (`userId`));

DELIMITER //
CREATE PROCEDURE `add_search_list` (
	IN `name` varchar(45),
	IN `userId` int,
	IN `query` text,
	IN `source` varchar(45)
)
BEGIN
	DECLARE saved int DEFAULT 0;

	SELECT 1 into saved FROM search_lists AS s
	  WHERE s.name = name
		  AND s.userId = userId
	  LIMIT 1;

	IF (saved = 0) THEN
	  INSERT INTO search_lists (`name`, `userId`, `query`, `source`)
		  VALUES (name, userId, query, source);
	END IF;
END//
DELIMITER ;

CREATE  TABLE `likes` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `userId` INT NOT NULL ,
  `postId` INT NOT NULL ,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY (`id`) );

DELIMITER //
CREATE PROCEDURE `add_like` (
	IN userId INT,
	IN postId INT,
	IN created TIMESTAMP)
BEGIN
  DECLARE liked INT DEFAULT 0;
  DECLARE subscribed INT DEFAULT 0;

  SELECT 1 INTO liked FROM likes
    WHERE userId = userId AND postId = postId
  LIMIT 1;

  IF (liked = 0) THEN
    SELECT 1 INTO subscribed FROM posts AS p
      WHERE p.id = postId AND EXISTS (
        SELECT f.userId FROM `following` AS f WHERE f.targetId = p.userId AND f.userId = userId
    LIMIT 1;

    IF (subscribed = 1) THEN
      INSERT INTO `likes` (userId, postId, created) VALUES (userId, postId, created);
      UPDATE `posts` SET likesCount = likesCount + 1 WHERE id = postId;
      END IF;
    END IF;
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE `delete_like` (
	IN userId INT,
	IN postId INT
)
BEGIN
	DELETE FROM likes WHERE userId = userId AND postId = postId;
	IF (ROW_COUNT() > 0) THEN
		UPDATE posts SET likesCount = likesCount - 1 WHERE id = postId;
	END IF;
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER post_inserted AFTER INSERT ON `posts` FOR EACH ROW
  UPDATE `users` SET posts = posts + 1 WHERE id = NEW.userId;//
DELIMITER ;

DELIMITER //
CREATE TRIGGER post_deleted AFTER DELETE ON `posts` FOR EACH ROW
	UPDATE `users` SET posts = posts - 1 WHERE id = OLD.userId;//
DELIMITER ;

DELIMITER //
CREATE TRIGGER comment_inserted AFTER INSERT ON `comments` FOR EACH ROW
	UPDATE `posts` SET commentsCount = commentsCount + 1 WHERE id = NEW.postId;//
DELIMITER ;

DELIMITER //
CREATE TRIGGER comment_deleted AFTER DELETE ON `comments` FOR EACH ROW
	UPDATE `posts` SET commentsCount = commentsCount - 1 WHERE id = OLD.postId;//
DELIMITER ;

CREATE TABLE `following` (
  `userId` int(11) NOT NULL,
  `targetId` int(11) NOT NULL,
  PRIMARY KEY (`userId`,`targetId`),
  KEY `FK_following_users_user_idx` (`userId`),
  KEY `FK_following_users_target_idx` (`targetId`),
  CONSTRAINT `FK_following_users_target` FOREIGN KEY (`targetId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_following_users_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

DELIMITER $$
CREATE TRIGGER following_added AFTER INSERT ON `following`
  FOR EACH ROW BEGIN
	  UPDATE `users` SET following = following + 1 WHERE id = NEW.userId;
	  UPDATE `users` SET followers = followers + 1 WHERE id = NEW.targetId;
  END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER `following_removed` AFTER DELETE ON `following`
  FOR EACH ROW BEGIN
	  UPDATE `users` SET following = following - 1 WHERE id = OLD.userId;
	  UPDATE `users` SET followers = followers - 1 WHERE id = OLD.targetId;
  END$$
DELIMITER ;


/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;