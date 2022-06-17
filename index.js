const core = require('@actions/core');
const request = require('request-promise-native');

try {
  const apiKey = process.env.TRELLO_API_KEY;
  const apiToken = process.env.TRELLO_API_TOKEN;
  const boardId = process.env.TRELLO_TEST_BOARD_ID;
  const refContext = process.env.GITHUB_REF_CONTEXT;
  const action = 'add_labels_when_push';

  console.log(apiKey);
  console.log(apiToken);
  console.log(boardId);
  console.log(refContext);
  console.log(action);

  switch (action) {
    case 'add_labels_when_push':
      addLabelsAngular(apiKey, apiToken, boardId, refContext);
      break;

  }
} catch (error) {
  core.setFailed(error.message);
}

function addLabelsAngular(apiKey, apiToken, boardId, refContext) {
  console.log(refContext);
  const departureListId = process.env.TRELLO_TEST_LIST1_ID;
  console.log(departureListId);
  const ynumber = refContext.match(/y[0-9]{4}$/) != null ?  refContext.match(/y[0-9]{4}$/)[0] : '';
  console.log(ynumber);
  const snumber = refContext.match(/s[0-9]{4}$/) != null ?  refContext.match(/s[0-9]{4}$/)[0] : '';

  console.log(snumber);
  const trelloLabelIds = [];
  getLabelsOfBoard(apiKey, apiToken, boardId).then(function(response) {
    const trelloLabels = response;
      trelloLabels.forEach(function(trelloLabel) {
        if (trelloLabel.name == 'Angular') {
          trelloLabelIds.push(trelloLabel.id);
        }
      });
    });

  console.log(trelloLabelIds);
    getCardsOfList(apiKey, apiToken, departureListId).then(function(response) {
      const cards = response;
      let cardId;
      cards.some(function(card) {
  console.log(card.name);
  console.log(card.name.match(/y[0-9]{4}$/));
  console.log(card.name.match(/s[0-9]{4}$/));
        const card_ynumber = card.name.match(/y[0-9]{4}$/) != null ? card.name.match(/y[0-9]{4}$/)[0] : '';
  console.log(card_ynumber);
        const card_snumber = card.name.match(/s[0-9]{4}$/) != null ? card.name.match(/s[0-9]{4}$/)[0] : '';
  console.log(card_snumber);
        if (card_ynumber == ynumber || card_snumber == snumber) {
          cardId = card.id;
          return true;
        }
      });
      const cardParams = {
        labelIds: trelloLabelIds.join()
      }
  console.log(cardParams);
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
  console.log(apiKey,apiToken,boardId);
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