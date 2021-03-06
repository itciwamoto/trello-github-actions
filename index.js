const core = require('@actions/core');
const request = require('request-promise-native');

try {
  const apiKey = process.env.TRELLO_API_KEY;
  const apiToken = process.env.TRELLO_API_TOKEN;
  const boardId = process.env.TRELLO_BOARD_ID;
  const labelName = process.env.TRELLO_LABEL_NAME;
  const refContext = process.env.GITHUB_REF_CONTEXT;

  addLabelsAngular(apiKey, apiToken, boardId, refContext, labelName);

} catch (error) {
  core.setFailed(error.message);
}

function addLabelsAngular(apiKey, apiToken, boardId, refContext, labelName) {
  const departureListId = process.env.TRELLO_LIST_ID;
  const ynumber = refContext.match(/y\d{4}/) != null ?  refContext.match(/y\d{4}/)[0] : '10000';
  const snumber = refContext.match(/s\d{4}/) != null ?  refContext.match(/s\d{4}/)[0] : '10000';

  const tempTrelloLabelIds = [];
  getLabelsOfBoard(apiKey, apiToken, boardId).then(function(response) {
    const trelloLabels = response;
      trelloLabels.forEach(function(trelloLabel) {
        if (trelloLabel.name == labelName) {
          tempTrelloLabelIds.push(trelloLabel.id);
        }
      });

      getCardsOfList(apiKey, apiToken, departureListId).then(function(cards) {
        let cardId;
        cards.forEach(function(card) {
          const card_ynumber = card.name.match(/y\d{4}/) != null ? card.name.match(/y\d{4}/)[0] : '20000';
          const card_snumber = card.name.match(/s\d{4}/) != null ? card.name.match(/s\d{4}/)[0] : '20000';
          if (card_ynumber == ynumber || card_snumber == snumber) {
            console.log(card);
            cardId = card.id;
            card.idLabels.forEach(function (cardLabel) {
              tempTrelloLabelIds.push(cardLabel);
             });
            return true;
          }
        });

        const trelloLabelIds = Array.from(new Set(tempTrelloLabelIds));
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