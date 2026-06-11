-- AI記事生成（プロンプト＋添付画像）で使用する画像保存用Storageバケット

insert into storage.buckets (id, name, public)
values ('article-images', 'article-images', true)
on conflict (id) do nothing;

create policy "public_read_article_images" on storage.objects
  for select using (bucket_id = 'article-images');
