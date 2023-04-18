(function ($, Drupal) {
  Drupal.behaviors.xAPIListener = {
    attach: function (context, settings) {

      if (context !== window.document) return;

      if (window.H5P && window.H5P.externalDispatcher) {
        let moduleSettings = settings.xAPIListener;
        let statements = [];
        let quizId;
        let questionId;
        const url = new URL(window.location.href);

        if (url.pathname.split('/')[4] === 'take') {
          quizId = parseInt(url.pathname.split('/')[3]);
          const getQuestionId = $('[id^="edit-question-"]').attr('id');
          questionId = parseInt(getQuestionId.match(/\d+/)[0]);
        }
        H5P.externalDispatcher.on('xAPI', function (event) {
          const statement = event.data.statement;
          const subContentId = statement.object.definition?.extensions?.["http://h5p.org/x-api/h5p-subContentId"];
          if (statement.verb.id === "http://adlnet.gov/expapi/verbs/completed") {
            if (!subContentId) {
              console.log('Completed column/quiz content type');
              processStatement(statement);
            }
          } else if (statement.verb.id === "http://adlnet.gov/expapi/verbs/answered" && !subContentId) {
            console.log('Regulat content');
            processStatement(statement);
          }
        });

        function processStatement(statement) {
          if (statement.result) {
            statements.push({
              qid: quizId,
              qqid: questionId,
              score: statement.result.score.raw,
              max: statement.result.score.max,
            });
            $.ajax({
              url: moduleSettings.endpointUrl,
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify(statements),
              success: function() {
                statements = [];
              }
            });
          }
        }
      }
    },
  };
})(jQuery, Drupal);
