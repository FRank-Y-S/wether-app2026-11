import { useState, useEffect } from 'react';

const App = () => {
  // お気に入りの都市リストを管理するState
  const [favorites, setFavorites] = useState(() => {
    // 1. localStorageから保存データを取り出す
    const saved = localStorage.getItem('weather-favorites');
    // 2. データがあればJSONに戻す。なければ空の配列を初期化する
    return saved ? JSON.parse(saved) : [];
  });

  // お天気情報を管理するためのState
  const [weather, setWeather] = useState(null);
  // 読み込みを管理するState
  const [loading, setLoading] = useState(true);
  // エラーを管理するためのState
  const [error, setError] = useState(null);

  const [city, setCity] = useState('Tokyo');
  const [inputCity, setInputCity] = useState('');

  
  useEffect(() => {
    localStorage.setItem('weather-favorites', JSON.stringify(favorites));
  },[favorites]);

  const handleSubmit = (e) => {
      e.preventDefault();

      if (inputCity.trim() === '') return;
      setCity(inputCity);
      setInputCity('');
  }

  // お気に入りに追加する関数
  const handleAddFavorite = () => {
    // 1. まだ何も検索されていない、または天気データがない場合は何もしない
    if(!weather || !weather.name) return;

    const cityName = weather.name;

    // 2. すでに同じ都市がお気に入りに入っていなかったら追加する
    if(!favorites.includes(cityName)) {
      setFavorites([...favorites, cityName]);
    }
  };

  useEffect(() => {
    //  1. APIを叩くための非同期処理関数を定義する
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);

      try {
        const API_KEY = 'ce179152c55b92b42cc75d4694fc41b4';
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=ja&appid=${API_KEY}`;

        const response = await fetch(url); // サーバーに通信(リクエスト)を送り、返事を待つ

        // もしサーバーから、「そんな都市はないよ(エラー)」と返ってきた場合
        if(!response.ok) {
          throw new Error('都市が見つかりませんでした');
        }

        // 返ってきたデータをJavaScriptで扱いやすい形(JSON)に変換する
        const data = await response.json();
        setWeather(data); // 成功したらデータをStateに保存

      } catch(e) {
        // エラーになった場合はこの処理にジャンプする
        setError(e.message); // エラー内容をStateに保存して画面に描画する
        setWeather(null); // それと同時に古い天気データを消去しておく

      } finally {
        setLoading(false);
      }
    };
    // 定義した関数をすぐ実行する
    fetchWeather();
  }, [city]);

  return (
    <>
      <h1>お天気アプリ(レベル２)</h1>
      <form onSubmit={handleSubmit}>
        <input
          type='text'
          value={inputCity}
          placeholder='都市名を入力'
          onChange={(e) => setInputCity(e.currentTarget.value)}
        />
        <button type='submit'>検索</button>
      </form>

      {/* お気に入り都市の一覧リスト */}
      <div style={{marginTop: '20px' }}>
        <h3>⭐️ お気に入り一覧</h3>
        {favorites.length === 0 ? (
          <p>お気に入りはまだ登録されていません</p>
        ) : (
          <ul>
            {favorites.map((favCity, index) => (
              <li key={index} style={{ marginBottom: '5px', listStyle: 'none' }}>
                {/* buttonを押すと、その都市名が`city`にセットされて自動で天気が検索される */}
                <button onClick={() => setCity(favCity)}>
                  {favCity}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 読み込み中の時 */}
      {loading && <p>読み込み中...</p>}

      {/* エラーが起きた時 */}
      {error && <p style={{ color: 'red'}}>{error}</p>}

      {/* 天気データがある時 */}
      {weather && (
      <div>
        <h2>{weather.name} の天気</h2>
        <p>湿度: {weather.main.temp}℃</p>
        <p>天気: {weather.weather[0].description}</p>
        {/* お気に入りボタンを追加 */}
        <button onClick={handleAddFavorite}>⭐️ お気に入りに追加</button>
      </div>
      )}
    </>
  );
};

export default App;