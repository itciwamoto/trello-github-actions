const core = require('@actions/core');
const request = require('request-promise-native');

try {
  const apiKey = process.env['TRELLO_API_KEY'];
  const apiToken = process.env['TRELLO_API_TOKEN'];
  const boardId = process.env['TRELLO_TEST_BOARD_ID'];
  const refContext = process.env['GITHUB_REF_CONTEXT'];
  const action = core.getInput('trello-action');

  switch (action) {
    case 'add_labels_when_push':
      addLabelsAngular(apiKey, apiToken, boardId, refContext);
      break;

  }
} catch (error) {
  core.setFailed(error.message);
}

function addLabelsAngular(apiKey, apiToken, boardId, refContext) {
  const departureListId = process.env['TRELLO_TEST_LIST1_ID'];
  const ynumber = refContext.match(/y[0-9]{4}$/)[0].slice(1);
  const snumber = refContext.match(/s[0-9]{4}$/)[0].slice(1);

  getLabelsOfBoard(apiKey, apiToken, boardId).then(function(response) {
    const trelloLabels = response;
    const trelloLabelIds = [];
      trelloLabels.forEach(function(trelloLabel) {
        if (trelloLabel.name == 'Angular') {
          trelloLabelIds.push(trelloLabel.id);
        }
      });
    });

    getCardsOfList(apiKey, apiToken, departureListId).then(function(response) {
      const cards = response;
      let cardId;
      cards.some(function(card) {
        const card_ynumber = card.name.match(/y[0-9]{4}$/)[0].slice(1);
        const card_snumber = card.name.match(/s[0-9]{4}$/)[0].slice(1);
        if (card_ynumber == ynumber || card_snumber == snumber) {
          cardId = card.id;
          return true;
        }
      });
      const cardParams = {
        labelIds: trelloLabelIds.join()
      }

      if (cardId) {
        addLabelsCard(apiKey, apiToken, cardId, cardParams).then(function(response) {
        });
      } else {
        core.setFailed('Card not found.');
      }
    });
  }

function addLabelsCard(apiKey, apiToken, cardId, params) {
  const options = {
    method: 'PUT',
    url: `https://api.trello.com/1/cards/${cardId}?key=${apiKey}&token=${apiToken}`,
    form: {
      'idLabels': params.labelIds
    }
  }
  return new Promise(function(resolve, reject) {
    request(options)
      .then(function(body) {
        resolve(JSON.parse(body));
      })
      .catch(function(error) {
        reject(error);
      })
  });
}

function getLabelsOfBoard(apiKey, apiToken, boardId) {
  return new Promise(function(resolve, reject) {
    request(`https://api.trello.com/1/boards/${boardId}/labels?key=${apiKey}&token=${apiToken}`)
      .then(function(body) {
        resolve(JSON.parse(body));
      })
      .catch(function(error) {
        reject(error);
      })
  });
}

function getCardsOfList(apiKey, apiToken, listId) {
  return new Promise(function(resolve, reject) {
    request(`https://api.trello.com/1/lists/${listId}/cards?key=${apiKey}&token=${apiToken}`)
      .then(function(body) {
        resolve(JSON.parse(body));
      })
      .catch(function(error) {
        reject(error);
      })
  });
}