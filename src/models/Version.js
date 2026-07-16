import { reactive } from 'vue';

export default class Version {
  static fetch(id) {
    if (!id) return;
    if (!this.versionsMap)
      this.versionsMap = {};
    if (this.versionsMap[id])
      return this.versionsMap[id];
    // Create a reactive version instance and store it in the versionsMap
    // This ensures that when loadData fetches the data and updates the version instance,
    // any components using this version will reactively update as well.
    const version = reactive(new Version(id));
    this.versionsMap[id] = version;
    version.loadData();
    return version;
  }

  static isLoading() {
    if (!this.versionsMap)
      return false;
    for (let version of Object.values(this.versionsMap)) {
      if (!version.data)
        return true;
    }
    return false;
  }

  constructor(id, name) {
    this.id = id;
    this.data = null;
    this.loading = false;
  }

  loadData() {
    if (this.data || this.loading) return;
    this.loading = true;
    this.fetchData(data => {
      this.loading = false;
      this.data = data;
    });
  }

  fetchData(callback) {
    fetch(`${global.staticPath}/versions/${this.id}.json`)
      .then(data => {
        if (!data.ok) throw new Error("HTTP error " + data.status);
        return data.json();
      }).
      then(callback).
      catch(error => {
        this.loading = false;
        console.error("Failed to fetch version data:", error);
      });
  }
}
