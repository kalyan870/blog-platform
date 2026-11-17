import test from 'node:test';
import assert from 'node:assert/strict';
import { createBlogRepository } from '../db.js';

function fakeSql(result = []) {
  const calls = [];
  return { calls, query: async (...args) => { calls.push(args); return result; } };
}

test('post writes bind content and constrain edits/deletes to Clerk owner', async () => {
  const sql = fakeSql([{ id: '7' }]);
  const repo = createBlogRepository(sql);
  await repo.createPost('user_1', 'Writer', { title: "x'); DROP TABLE posts;--", content: 'body', excerpt: 'summary' });
  assert.equal(sql.calls[0][1][0], 'user_1');
  assert.equal(sql.calls[0][1][2], "x'); DROP TABLE posts;--");
  assert.doesNotMatch(sql.calls[0][0], /DROP TABLE/);
  await repo.updatePost('user_1', '7', { title: 'new', content: 'body', excerpt: 'summary' });
  await repo.deletePost('user_1', '7');
  for (const [query, params] of sql.calls.slice(1)) {
    assert.match(query, /WHERE author_id = \$1 AND id = \$2/);
    assert.deepEqual(params.slice(0, 2), ['user_1', '7']);
  }
});

test('comment reads and deletion use bound record ids and author ownership', async () => {
  const sql = fakeSql([]);
  const repo = createBlogRepository(sql);
  await repo.listComments('12');
  await repo.deleteComment('user_2', '9');
  assert.deepEqual(sql.calls[0][1], ['12']);
  assert.match(sql.calls[1][0], /WHERE author_id = \$1 AND id = \$2/);
  assert.deepEqual(sql.calls[1][1], ['user_2', '9']);
});
