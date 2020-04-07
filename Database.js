/*
 *  Copyright (C) 2020 Groupe MINASTE
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 */

// Constructor
function Database(con) {
  // Save connection
  this._con = con;

  // Setup database
  this._con.query('CREATE TABLE IF NOT EXISTS `classes` (`id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY, `role` varchar(255) NOT NULL, `name` varchar(255) NOT NULL);', function (err, result) {
    if (err) throw err;
  });
  this._con.query('CREATE TABLE IF NOT EXISTS `profs` (`id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY, `user` varchar(255) NOT NULL, `classe` int(11) NOT NULL, `name` varchar(255) NOT NULL);', function (err, result) {
    if (err) throw err;
  });
  this._con.query('CREATE TABLE IF NOT EXISTS `cours` (`id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY, `prof` int(11) NOT NULL, `start` datetime NOT NULL);', function (err, result) {
    if (err) throw err;
  });
  this._con.query('CREATE TABLE IF NOT EXISTS `devoirs` (`id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY, `prof` int(11) NOT NULL, `content` text NOT NULL, `due` datetime NOT NULL);', function (err, result) {
    if (err) throw err;
  });
};

// Get courses
Database.prototype.getCours = function(callback) {
  // Fetch all courses
  this._con.query('SELECT cours.id as id, profs.name as name, classes.name as classe, classes.role as role, cours.start as start, profs.user as user FROM cours LEFT JOIN profs ON cours.prof = profs.id LEFT JOIN classes ON profs.classe = classes.id ORDER BY start', (err, results, fields) => {
    if (err) {
      return console.error(err.message);
    }

    // Callback
    callback(results);
  });
};

// Get homeworks
Database.prototype.getDevoirs = function(callback) {
  // Fetch all courses
  this._con.query('SELECT devoirs.id as id, profs.name as name, classes.name as classe, classes.role as role, devoirs.due as due, devoirs.content as content, profs.user as user FROM devoirs LEFT JOIN profs ON devoirs.prof = profs.id LEFT JOIN classes ON profs.classe = classes.id ORDER BY due', (err, results, fields) => {
    if (err) {
      return console.error(err.message);
    }

    // Callback
    callback(results);
  });
};

// Get profs
Database.prototype.getProfs = function(callback) {
  // Fetch all teachers
  this._con.query('SELECT profs.id as id, profs.name as name, classes.name as classe, classes.role as role, profs.user as user FROM profs LEFT JOIN classes ON profs.classe = classes.id', (err, results, fields) => {
    if (err) {
      return console.error(err.message);
    }

    // Callback
    callback(results);
  });
};

// Check prof
Database.prototype.checkProf = function(user, classe, matiere, owner, callback) {
  // Fetch all teachers
  this._con.query('SELECT profs.id as id, profs.name as name, profs.user as user, classes.name as classe FROM profs LEFT JOIN classes ON profs.classe = classes.id WHERE profs.user = ? OR ?', [user, user == owner], (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }
    if (results && results.length > 0) {
      this._con.query('SELECT profs.id as id, profs.name as name, profs.user as user, classes.name as classe FROM profs LEFT JOIN classes ON profs.classe = classes.id WHERE (profs.user = ? OR ?) AND classes.name = ? AND profs.name = ?', [user, user == owner, classe, matiere], (error, profs, fields) => {
        if (error) {
          return console.error(error.message);
        }

        // Callback
        callback(profs && profs.length > 0 ? 1 : 2, profs[0]);
      });
    } else {
      // Callback
      callback(3, undefined);
    }
  });
};

// Add classe
Database.prototype.addClasse = function (role, name, callback) {
  // Insert in database
  this._con.query('INSERT INTO classes (role, name) VALUES(?, ?)', [role, name], (err, results, fields) => {
    if (err) {
      return console.error(err.message);
    }

    // Callback
    callback(1);
  });
};

// Add prof
Database.prototype.addProf = function (user, classe, name, callback) {
  // Check classe
  this._con.query('SELECT * FROM classes WHERE name = ?', [classe], (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }
    if (results && results.length > 0) {
      // Insert in database
      this._con.query('INSERT INTO profs (user, classe, name) VALUES(?, ?, ?)', [user, results[0].id, name], (err, results, fields) => {
        if (err) {
          return console.error(err.message);
        }

        // Callback
        callback(1);
      });
    } else {
      // Callback
      callback(2);
    }
  });
};

// Add cours
Database.prototype.addCours = function (prof, date, heure, callback) {
  // Insert in database
  this._con.query('INSERT INTO cours (prof, start) VALUES(?, ?)', [prof, date[2] + '-' + date[1] + '-' + date[0] + ' ' + heure[0] + ':' + heure[1]], (err, results, fields) => {
    if (err) {
      return console.error(err.message);
    }

    // Callback
    callback();
  });
};

// Add devoirs
Database.prototype.addDevoirs = function (prof, date, heure, content, callback) {
  // Insert in database
  this._con.query('INSERT INTO devoirs (prof, due, content) VALUES(?, ?, ?)', [prof, date[2] + '-' + date[1] + '-' + date[0] + ' ' + heure[0] + ':' + heure[1], content], (err, results, fields) => {
    if (err) {
      return console.error(err.message);
    }

    // Callback
    callback();
  });
};

// Export
module.exports = Database;
