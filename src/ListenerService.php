<?php

namespace Drupal\xapi_listener;

use Drupal;
use Drupal\Core\Database\Connection;

/**
 * Class ListenerService.
 */
class ListenerService
{

  /**
   * Database connection.
   *
   * @var Connection
   */
  protected $database;

  /**
   * Constructs a new ListenerService object.
   *
   * @param Connection $database
   *   The database connection object.
   */
  public function __construct(Connection $database)
  {
    $this->database = $database;
  }

  /**
   * Log statements to the database.
   *
   * @param array $statements
   *   The statements to log.
   */
  public function logStatements(array $statements)
  {
    foreach ($statements as $statement) {
      $qtitle = $this->database->select('quiz', 'q')
        ->fields('q', ['title'])
        ->condition('qid', $statement['qid'])
        ->execute()
        ->fetchField();

      $this->database->merge('xapi_listener_statements')
        ->key([
          'qid' => $statement['qid'],
          'qqid' => $statement['qqid'],
          'uid' => Drupal::currentUser()->id(),
        ])
        ->fields([
          'qtitle' => $qtitle,
          'score_raw' => $statement['score'],
          'score_max' => $statement['max'],
          'created' => Drupal::time()->getRequestTime(),
        ])
        ->execute();
    }
  }
}
