async function test() {
  try {
     const res1 = await fetch(`https://p.oceansaver.in/ajax/download.php?copyright=0&format=1080&url=https://www.youtube.com/watch?v=dQw4w9WgXcQ`);
     const text1 = await res1.text();
     console.log('ddownr:', text1.substring(0, 500));
  } catch(e) { console.error(e) }
}
test();
