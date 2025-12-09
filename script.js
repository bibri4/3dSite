// ССЫЛКА НА GOOGLE SHEETS (формат CSV, "Опубликовать в интернете").
// Пример: https://docs.google.com/spreadsheets/d/e/ABC123/pub?output=csv
// Замените строку ниже на свою опубликованную ссылку.
const googleSheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR4Br8_bYtNQKuXSpQWVa4qmzjCGYJ1R7vReQgaWJcVaVfbbEvyaZviTjoqwVb2VeXR2E7Hb3-bYqpb/pub?gid=0&single=true&output=csv";

const grid = document.getElementById("portfolio-grid");
const statusEl = document.getElementById("status");

async function loadPortfolio() {
  setStatus("Загружаем работы...");

  try {
    const response = await fetch(googleSheetURL);
    if (!response.ok) {
      throw new Error(`Ошибка сети: ${response.status}`);
    }

    const csvText = await response.text();
    const items = parseCSV(csvText);

    if (!items.length) {
      setStatus("Нет данных в таблице.");
      return;
    }

    renderCards(items);
    setStatus(`Загружено: ${items.length}`);
  } catch (error) {
    console.error("Не удалось загрузить данные из таблицы:", error);
    setStatus("Не удалось загрузить данные. Проверьте ссылку или публикацию таблицы.");
  }
}

function setStatus(message) {
  statusEl.textContent = message;
}

function renderCards(items) {
  grid.innerHTML = "";
  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "card";

    const img = document.createElement("img");
    img.src = item.image_url || "";
    img.alt = item.title || "Работа";
    img.loading = "lazy";
    img.onerror = () => {
      // Показать плейсхолдер, если картинка недоступна
      img.src = "https://via.placeholder.com/400x250?text=3D+Print";
    };

    const body = document.createElement("div");
    body.className = "card-body";

    const title = document.createElement("h3");
    title.textContent = item.title || "Без названия";

    const desc = document.createElement("p");
    desc.textContent = item.description || "Описание отсутствует.";

    const price = document.createElement("div");
    price.className = "price";
    price.textContent = item.price ? `от ${item.price}` : "Цена по запросу";

    body.append(title, desc, price);
    card.append(img, body);
    grid.append(card);
  });
}

function parseCSV(csv) {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const cells = splitCSVLine(line);
    const obj = {};
    headers.forEach((header, idx) => {
      obj[header] = cells[idx] ? cells[idx].trim() : "";
    });
    return obj;
  });
}

// Упрощённый разбор строки CSV, учитывающий кавычки.
function splitCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && line[i + 1] === '"') {
      current += '"';
      i++; // пропускаем экранированную кавычку
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

// Подсказка: прямую ссылку на файл с Google Диска можно получить:
// 1) Загрузить файл и сделать его "Доступным по ссылке".
// 2) Взять fileId из URL https://drive.google.com/file/d/FILE_ID/view
// 3) Прямая ссылка: https://drive.google.com/uc?export=view&id=FILE_ID
// Эту ссылку используйте в колонке image_url в таблице.

loadPortfolio();

