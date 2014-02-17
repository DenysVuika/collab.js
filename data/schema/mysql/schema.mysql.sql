-- v.0.5.0-alpha

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

CREATE DATABASE IF NOT EXISTS `collabjs` /*!40100 DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci */;
USE `collabjs`;

--------------------------------------
-- TABLES
--------------------------------------

CREATE TABLE `users` (
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

CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
  `loweredName` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `user_roles` (
  `userId` int(11) NOT NULL,
  `roleId` int(11) NOT NULL,
  PRIMARY KEY (`userId`,`roleId`),
  KEY `FK_ur_user_idx` (`userId`),
  KEY `FK_ur_role_idx` (`roleId`),
  CONSTRAINT `FK_ur_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_ur_role` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `content` text COLLATE utf8_unicode_ci NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `commentsCount` int(11) NOT NULL DEFAULT '0',
  `likesCount` int(11) NOT NULL DEFAULT '0',
  `type` smallint(6) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `FK_Posts_Users_idx` (`userId`),
  CONSTRAINT `FK_Posts_Users` FOREIGN KEY (`userId`) REFERENCES `users` (`Id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `comments` (
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

CREATE TABLE `likes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `postId` int(11) NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `following` (
  `userId` int(11) NOT NULL,
  `targetId` int(11) NOT NULL,
  PRIMARY KEY (`userId`,`targetId`),
  KEY `FK_following_users_user_idx` (`userId`),
  KEY `FK_following_users_target_idx` (`targetId`),
  CONSTRAINT `FK_following_users_target` FOREIGN KEY (`targetId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_following_users_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `wall` (
  `userId` int(11) NOT NULL,
  `postId` int(11) NOT NULL,
  PRIMARY KEY (`userId`,`postId`),
  KEY `FK_Wall_Posts_idx` (`postId`),
  CONSTRAINT `FK_Wall_Posts` FOREIGN KEY (`postId`) REFERENCES `posts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_Wall_Users` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `news` (
  `userId` int(11) NOT NULL,
  `postId` int(11) NOT NULL,
  PRIMARY KEY (`userId`,`postId`),
  KEY `FK_News_Posts_idx` (`postId`),
  CONSTRAINT `FK_News_Posts` FOREIGN KEY (`postId`) REFERENCES `posts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_News_Users` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `content` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `content_UNIQUE` (`content`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `post_tags` (
  `postId` int(11) NOT NULL,
  `tagId` int(11) NOT NULL,
  PRIMARY KEY (`postId`,`tagId`),
  KEY `FK_pt_tag_idx` (`tagId`),
  CONSTRAINT `FK_pt_tag` FOREIGN KEY (`tagId`) REFERENCES `tags` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_pt_post` FOREIGN KEY (`postId`) REFERENCES `posts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--------------------------------------
-- FUNCTIONS
--------------------------------------

DELIMITER $$
CREATE FUNCTION `USER_ROLES`(
  uid INT
) RETURNS TEXT CHARSET utf8 COLLATE utf8_unicode_ci
BEGIN
  DECLARE result TEXT;
  SET result =
  (
    SELECT GROUP_CONCAT(r.loweredName separator ',') AS roles
    FROM roles AS r, user_roles AS ur
    WHERE r.id = ur.roleId AND ur.userId = uid
    ORDER BY r.loweredName
  );
  RETURN result;
END$$
DELIMITER ;

CREATE FUNCTION `POST_TAGS`(
  postId INT
) RETURNS text CHARSET utf8 COLLATE utf8_unicode_ci
BEGIN
	DECLARE RESULT TEXT;
	SET RESULT =
	(
		SELECT GROUP_CONCAT(t.content separator ',') FROM posts AS p
		LEFT JOIN post_tags AS pt ON pt.postId = p.id
		LEFT JOIN tags AS t ON t.id = pt.tagId
		WHERE p.Id = postId
	);
	RETURN RESULT;
END

DELIMITER $$
CREATE FUNCTION `SPLIT_STR`(
	str TEXT,
	delim VARCHAR(12),
	pos INT
) RETURNS text CHARSET utf8 COLLATE utf8_unicode_ci
    DETERMINISTIC
BEGIN
	DECLARE output TEXT;

	SET output = REPLACE(SUBSTRING(SUBSTRING_INDEX(str, delim, pos),
       LENGTH(SUBSTRING_INDEX(str, delim, pos - 1)) + 1),
       delim, '');

	IF output = '' THEN SET output = null; END IF;
	RETURN output;
END$$
DELIMITER ;

--------------------------------------
-- VIEWS
--------------------------------------

CREATE OR REPLACE VIEW `vw_accounts` AS
  SELECT
    u.id,
    u.account,
    u.name,
    u.created,
    u.email,
    u.password,
    u.emailHash as pictureId,
    u.location,
    u.website,
    u.bio,
    u.posts,
    u.comments,
    u.following,
    u.followers,
    USER_ROLES(u.id) as roles
  FROM users AS u
;

CREATE OR REPLACE VIEW `vw_users` AS
  SELECT
    u.id,
    u.account,
    u.name,
    u.created,
    u.email,
    u.emailHash as pictureId,
    u.location,
    u.website,
    u.bio,
    u.posts,
    u.comments,
    u.following,
    u.followers
  FROM users AS u
;

CREATE OR REPLACE VIEW `vw_posts` AS
  SELECT
    p.id,
    p.userId,
    u.name,
    u.account,
    u.emailHash as pictureId,
    p.content,
    p.created,
    p.commentsCount,
    p.likesCount,
    p.type,
    POST_TAGS(p.id) AS tags
  FROM posts AS p
  LEFT JOIN users AS u ON u.id = p.userId
;

CREATE OR REPLACE VIEW `vw_news` AS
  SELECT p.*, n.userId as targetId
  FROM news AS n
  LEFT JOIN vw_posts AS p on p.id = n.postId
;

CREATE OR REPLACE VIEW `vw_wall` AS
  SELECT p.*, w.userId as targetId
  FROM wall AS w
  LEFT JOIN vw_posts AS p on p.id = w.postId
;

CREATE OR REPLACE VIEW `vw_people` AS
  SELECT
    u.id,
    u.account,
    u.name,
    u.created,
    u.website,
    u.location,
    u.bio,
    u.emailHash as pictureId,
    u.posts,
    u.following,
    u.followers
  FROM users AS u
;

CREATE OR REPLACE VIEW `vw_comments` AS
  SELECT
    c.id,
    c.postId,
    c.userId,
    u.name,
    u.account,
    u.emailHash as pictureId,
    c.content,
    c.created
  FROM comments AS c
  LEFT JOIN users AS u ON u.id = c.userId
;

--------------------------------------
-- PROCEDURES
--------------------------------------

-- TODO: replace with inline query
DELIMITER $$
CREATE PROCEDURE `get_people`(
  IN topId INT
)
BEGIN
  SELECT p.* FROM vw_people AS p
  WHERE (topId <= 0 || p.id > topId)
  LIMIT 20;
END$$
DELIMITER ;

-- TODO: review
DELIMITER //
CREATE PROCEDURE `follow`(
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

-- TODO: review
DELIMITER //
CREATE PROCEDURE `unfollow`(
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

DELIMITER $$
CREATE PROCEDURE `get_posts_by_tag`(IN tag TEXT)
BEGIN
	SELECT p.* FROM vw_posts as p
  	LEFT JOIN post_tags AS pt ON pt.postId = p.id
  	LEFT JOIN tags AS t ON t.id = pt.tagId
  WHERE t.content = tag AND (topId <= 0 || p.id < topId)
  LIMIT 20;
END$$
DELIMITER ;

-- TODO: review
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

-- TODO: review
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
        SELECT f.userId FROM `following` AS f WHERE f.targetId = p.userId AND f.userId = userId)
    LIMIT 1;

    IF (subscribed = 1) THEN
      INSERT INTO `likes` (userId, postId, created) VALUES (userId, postId, created);
      UPDATE `posts` SET likesCount = likesCount + 1 WHERE id = postId;
      END IF;
    END IF;
END//
DELIMITER ;

-- TODO: review
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

DELIMITER $$
CREATE PROCEDURE `add_post`(
	IN userId INT,
	IN content TEXT,
	IN created TIMESTAMP
)
BEGIN
	DECLARE postId INT DEFAULT 0;

	INSERT INTO `posts` (userId, content, created)  VALUES (userId, content, created);
	SET postId = last_insert_id();

	IF (postId > 0) THEN
		INSERT INTO `wall` (userId, postId) VALUES (userId, postId);
		INSERT INTO `news` (userId, postId) VALUES (userId, postId);
		INSERT INTO `news` (userId, postId)
			SELECT f.userId, postId AS `postId` FROM `following` AS f WHERE f.targetId = userId;
	END IF;

	SELECT postId AS `insertId`;
END$$
DELIMITER ;

-- TODO: replace with inline query
DELIMITER $$
CREATE PROCEDURE `get_news`(
	IN userId INT,
	IN topId INT
)
BEGIN
  SELECT * FROM vw_news
  WHERE targetId = userId AND (topId <= 0 || id < topId)
  ORDER BY created DESC
  LIMIT 20;
END$$
DELIMITER ;

-- TODO: replace with inline query
DELIMITER $$
CREATE PROCEDURE `get_wall`(
	IN userId INT,
	IN topId INT
)
BEGIN
	SELECT * FROM vw_wall
  WHERE targetId = userId AND (topId <= 0 || id < topId)
  ORDER BY created DESC
  LIMIT 20;
END$$
DELIMITER ;

-- TODO: replace with inline query
DELIMITER $$
CREATE PROCEDURE `get_news_updates`(
	IN userId INT,
	IN topId INT
)
BEGIN
	SELECT * FROM vw_news
  WHERE targetId = userId AND (id > topId AND topId > 0)
  LIMIT 20;
END$$
DELIMITER ;

-- TODO: replace with inline query
DELIMITER $$
CREATE PROCEDURE `check_news_updates`(
	IN userId INT,
	IN topId INT
)
BEGIN
  SELECT COUNT(id) AS posts FROM vw_news
  WHERE targetId = userId AND (id > topId AND topId > 0)
  LIMIT 20;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `delete_news_post`(
	IN userId INT,
	IN postId INT
)
BEGIN
	DELETE FROM news WHERE news.userId = userId AND news.postId = postId;
END$$
DELIMITER ;

-- TODO: consider using trigger on `wall` to automate `news` cleanup
DELIMITER $$
CREATE PROCEDURE `delete_wall_post`(
	IN userId INT,
	IN postId INT
)
BEGIN
	-- delete post from wall, news and from followers' news
	DELETE FROM wall WHERE wall.userId = userId AND wall.postId = postId;
	IF (ROW_COUNT() > 0) THEN
		DELETE FROM news WHERE news.postId = postId;
	END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `add_mentions`(
	IN postId INT,
	IN accounts TEXT
)
BEGIN
	INSERT IGNORE INTO `news` (`userId`, `postId`)
		SELECT users.id AS `userId`, postId FROM users WHERE FIND_IN_SET(users.account, accounts);
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `assign_tags`(
	IN postId INT,
	IN str TEXT
)
BEGIN
	DECLARE i INTEGER;
	DECLARE tag VARCHAR(255);
	SET i = 1;
	REPEAT
		SET tag = SPLIT_STR(str, ',', i);
		IF tag IS NOT NULL THEN
			INSERT IGNORE INTO `tags` (`content`) VALUES (tag);
			SET i = i + 1;
		END IF;
		UNTIL tag IS NULL
	END REPEAT;

	INSERT IGNORE INTO `post_tags` (`postId`, `tagId`)
		SELECT postId, t.id FROM `tags` AS t WHERE FIND_IN_SET(t.content, str);
END$$
DELIMITER ;

--------------------------------------
-- TRIGGERS
--------------------------------------

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

--------------------------------------
-- DEFAULT DATA
--------------------------------------

INSERT INTO roles (`name`, `loweredName`)
  SELECT 'Administrator', 'administrator' FROM DUAL
    WHERE NOT EXISTS (SELECT * FROM `roles` WHERE `loweredName` = 'administrator')
  LIMIT 1;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;