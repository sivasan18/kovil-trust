
const BIN_ID = "6986ec2243b1c97be96be6df";
const API_KEY = "$2a$10$0LyVOSHktv9TebAFV0W/te4ymPYFjags.sfFb/LLsKOobPqcMU5Wu";
const URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

let membersData = [];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function toggleAdmin() {
    const panel = document.getElementById("adminPanel");
    panel.style.display = panel.style.display === "none" ? "block" : "none";
}

function login() {
    if (document.getElementById("pass").value === "admin123") {
        document.getElementById("loginSection").classList.add("hidden");
        document.getElementById("controls").classList.remove("hidden");
        populateMembersDropdown();
    } else {
        alert("Wrong password");
    }
}

const defaultNames = {
    1: "Ramani", 2: "Karthik", 3: "Santhosh", 4: "Kaliappan", 5: "Lokesh",
    6: "Sigamani", 7: "Ramakrishnan", 8: "Thavamani", 9: "Vinoth", 10: "Sathish", 11: "Perumal"
};

async function fetchData() {
    try {
        const res = await fetch(URL, { headers: { 'X-Master-Key': API_KEY } });
        const json = await res.json();
        let data = json.record.members || json.record;

        // Ensure all 11 members exist
        for (let i = 1; i <= 11; i++) {
            if (!data.find(m => m.id == i)) {
                data.push({ id: i, name: defaultNames[i], payments: {} });
            }
        }

        // Sort by ID naturally
        membersData = data.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        renderTable();
        populateMembersDropdown();
    } catch (err) {
        console.error("Error fetching data:", err);
    }
}

function populateMembersDropdown() {
    const sel = document.getElementById("member");
    if (!sel) return;

    // Save current selection to restore after refresh
    const currentVal = sel.value;
    sel.innerHTML = '<option value="">Select Member (ID + Name)</option>';

    membersData.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m.id;
        opt.textContent = `${m.id} - ${m.name}`;
        sel.appendChild(opt);
    });

    if (currentVal) sel.value = currentVal;
}

// Sync name input when member is selected
document.getElementById('member').addEventListener('change', (e) => {
    const member = membersData.find(m => m.id == e.target.value);
    if (member) {
        document.getElementById('memberName').value = member.name;
    }
});

function renderTable() {
    const body = document.getElementById("tableBody");
    body.innerHTML = "";

    let grandTotal = 0;

    membersData.forEach(m => {
        let row = `<tr>`;
        row += `<td>${m.id}</td>`;
        row += `<td style="text-align: left; font-weight: 600;">${m.name}</td>`;

        let memberTotal = 0;
        months.forEach(mon => {
            const val = m.payments ? (m.payments[mon] || 0) : 0;
            memberTotal += val;
            grandTotal += val;

            if (val > 0) {
                row += `<td class="paid-cell"><div class="paid-badge">₹${val}<span>✅</span></div></td>`;
            } else {
                row += `<td><span class="unpaid-icon">❌</span></td>`;
            }
        });

        row += `<td class="member-total">₹${memberTotal}</td>`;
        row += `</tr>`;
        body.innerHTML += row;
    });

    renderGrandTotal(grandTotal);
}

function renderGrandTotal(total) {
    const amountEl = document.getElementById("grandTotalAmount");
    if (amountEl) {
        amountEl.innerText = `₹${total}`;
    }
}

async function savePayment() {
    const id = document.getElementById("member").value;
    const newName = document.getElementById("memberName").value;
    const mon = document.getElementById("month").value;
    const amt = parseInt(document.getElementById("amount").value) || 0;
    const statusEl = document.getElementById("saveStatus");

    if (!id) return alert("Select a member No");

    statusEl.innerText = "Saving...";
    const m = membersData.find(m => m.id == id);
    if (m) {
        m.name = newName;
        if (!m.payments) m.payments = {};
        m.payments[mon] = amt;
    }

    await updateServer();
    statusEl.innerText = "Saved Successfully!";
    setTimeout(() => { statusEl.innerText = ""; }, 3000);
}

async function clearPayment() {
    const id = document.getElementById("member").value;
    const mon = document.getElementById("month").value;
    const statusEl = document.getElementById("saveStatus");

    if (!id) return alert("Select a member No");

    statusEl.innerText = "Clearing...";
    const m = membersData.find(m => m.id == id);
    if (m) {
        if (!m.payments) m.payments = {};
        m.payments[mon] = 0;
    }

    await updateServer();
    statusEl.innerText = "Cleared!";
    setTimeout(() => { statusEl.innerText = ""; }, 3000);
}

async function updateServer() {
    // If the data was wrapped in { members: [] }, keep that structure
    const payload = membersData;

    try {
        await fetch(URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": API_KEY
            },
            body: JSON.stringify(payload)
        });
        renderTable();
    } catch (err) {
        console.error("Error updating server:", err);
        alert("Server update failed!");
    }
}

fetchData();
setInterval(fetchData, 10000); // Auto-refresh every 10 seconds

