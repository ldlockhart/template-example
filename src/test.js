/**
full to simple
 */

async function convertFullToSimple(fullJson) {
  // The placeholder {collection} is replaced with 'conversion'.
  const endpoint = 'https://api.getbee.io/v1/conversion/full-to-simple-json';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BEEFREE_API_KEY}`
      },
      body: JSON.stringify({ page: fullJson })
    });

    // Error handling added to check for non-successful responses.
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API call failed with status ${response.status}: ${errorBody}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in convertFullToSimple:', error);
    throw error;
  }
}

/**
simple to full
 */
async function convertSimpleToFull(simpleJson) {
  const endpoint = 'https://api.getbee.io/v1/conversion/simple-to-full-json';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BEEFREE_API_KEY}`
      },
      body: JSON.stringify({ template: simpleJson })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API call failed with status ${response.status}: ${errorBody}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in convertSimpleToFull:', error);
    throw error;
  }
}
